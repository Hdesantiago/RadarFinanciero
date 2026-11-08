/*
 * Recopilador de noticias financieras — FASE 3.
 * Se ejecuta en GitHub Actions cada 6 horas (o manualmente).
 *
 * Flujo:
 *  1. Consultar GDELT y feeds RSS oficiales.
 *  2. Normalizar registros al modelo de noticia.
 *  3. Eliminar duplicados y agrupar acontecimientos relacionados.
 *  4. Fusionar con el historial reciente (sin crecer indefinidamente).
 *  5. Generar data/news.json, countries.json, categories.json,
 *     sources-status.json y last-update.json.
 *
 * Reglas: sin claves privadas, sin proxies CORS, manejar errores por fuente
 * sin detener el proceso, nunca inventar noticias, no destruir el catálogo
 * anterior si todas las fuentes fallan.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recopilarGdelt } from './connectors/gdelt.js';
import { recopilarRss } from './connectors/rss-generico.js';
import { normalizarLote } from './normalize-news.js';
import { deduplicar } from './deduplicate-news.js';
import {
  limitarNoticias, generarNewsJson, generarCountriesJson,
  generarCategoriesJson, generarSourcesStatusJson, generarLastUpdateJson,
  escribirJson, leerJsonSiExiste, fusionarConHistorial
} from './lib/generar-salidas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_DATA = path.join(__dirname, '..', 'public', 'data');
const RUTA_NEWS = path.join(DIR_DATA, 'news.json');

// Configuración de fuentes RSS oficiales.
// Solo URLs públicas verificadas en noviembre 2026; ver docs/fuentes.md.
// Fuentes sin RSS público verificable (FMI, Banco Mundial, Eurostat,
// Banxico, U.S. Treasury) quedan documentadas como no disponibles.
const FUENTES_RSS = [
  {
    id: 'fed',
    nombre: 'Reserva Federal de EE. UU.',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    region: 'Estados Unidos',
    categoriaDefecto: 'Bancos centrales',
    confiabilidad: 'Alta',
    paisFijo: 'Estados Unidos'
  },
  {
    id: 'bce',
    nombre: 'Banco Central Europeo',
    url: 'https://www.ecb.europa.eu/rss/press.html',
    region: 'Zona euro',
    categoriaDefecto: 'Bancos centrales',
    confiabilidad: 'Alta',
    paisFijo: 'Zona euro'
  },
  {
    id: 'bis',
    nombre: 'Bank for International Settlements',
    url: 'https://www.bis.org/rss.xml',
    region: 'Global',
    categoriaDefecto: 'Bancos centrales',
    confiabilidad: 'Alta'
  },
  {
    id: 'sec',
    nombre: 'Comisión de Bolsa y Valores de EE. UU. (SEC)',
    url: 'https://www.sec.gov/news/pressreleases.rss',
    region: 'Estados Unidos',
    categoriaDefecto: 'Regulación financiera',
    confiabilidad: 'Alta',
    paisFijo: 'Estados Unidos'
  }
];

async function recopilarTodas() {
  const todas = [];
  const estados = [];

  // GDELT
  try {
    const { noticias, errores } = await recopilarGdelt();
    todas.push(...noticias);
    estados.push({
      id: 'gdelt', nombre: 'GDELT Project', estado: 'ok',
      registros: noticias.length, errores: errores.length,
      ultimaRespuesta: new Date().toISOString(),
      detalleErrores: errores.slice(0, 5)
    });
  } catch (error) {
    estados.push({
      id: 'gdelt', nombre: 'GDELT Project', estado: 'error',
      registros: 0, error: error.message, ultimaRespuesta: new Date().toISOString()
    });
  }

  // Fuentes RSS
  for (const config of FUENTES_RSS) {
    try {
      const { noticias } = await recopilarRss(config);
      todas.push(...noticias);
      estados.push({
        id: config.id, nombre: config.nombre, estado: 'ok',
        registros: noticias.length, ultimaRespuesta: new Date().toISOString()
      });
    } catch (error) {
      estados.push({
        id: config.id, nombre: config.nombre, estado: 'error',
        registros: 0, error: error.message, ultimaRespuesta: new Date().toISOString()
      });
      // Continuar con la siguiente fuente
    }
  }

  return { todas, estados };
}

async function main() {
  console.log('=== RADAR FINANCIERO — Recopilador FASE 3 ===');
  console.log(`Inicio: ${new Date().toISOString()}`);

  // 1. Recopilar
  const { todas, estados } = await recopilarTodas();
  console.log(`Recopiladas (crudas): ${todas.length}`);
  console.log(`Fuentes OK: ${estados.filter((e) => e.estado === 'ok').length}/${estados.length}`);

  // 2. Normalizar
  const { validas, descartadas } = normalizarLote(todas);
  console.log(`Normalizadas: ${validas.length} | Descartadas: ${descartadas.length}`);

  // 3. Deduplicar y agrupar
  const { noticias, duplicados, grupos } = deduplicar(validas);
  console.log(`Tras deduplicar: ${noticias.length} | Duplicados: ${duplicados.length} | Grupos: ${grupos.size}`);

  // 4. Fusionar con historial y limitar
  const fusionadas = fusionarConHistorial(noticias, RUTA_NEWS);
  const finales = limitarNoticias(fusionadas);
  console.log(`Finales (con historial, limitadas): ${finales.length}`);

  // 5. Protección: no destruir el catálogo si no hay datos nuevos y el anterior existe
  const anterior = leerJsonSiExiste(RUTA_NEWS);
  if (finales.length === 0 && anterior?.noticias?.length > 0) {
    console.warn('ADVERTENCIA: no se obtuvieron noticias nuevas. Se conserva el catálogo anterior.');
    escribirJson(path.join(DIR_DATA, 'sources-status.json'), generarSourcesStatusJson(estados));
    escribirJson(path.join(DIR_DATA, 'last-update.json'), generarLastUpdateJson(anterior.noticias, estados));
    process.exit(0);
  }

  // 6. Generar archivos
  escribirJson(RUTA_NEWS, generarNewsJson(finales));
  escribirJson(path.join(DIR_DATA, 'countries.json'), generarCountriesJson(finales));
  escribirJson(path.join(DIR_DATA, 'categories.json'), generarCategoriesJson(finales));
  escribirJson(path.join(DIR_DATA, 'sources-status.json'), generarSourcesStatusJson(estados));
  escribirJson(path.join(DIR_DATA, 'last-update.json'), generarLastUpdateJson(finales, estados));

  console.log('Archivos generados en public/data/');
  console.log(`Fin: ${new Date().toISOString()}`);
}

main().catch((error) => {
  console.error('ERROR FATAL en el recopilador:', error);
  process.exit(1);
});
