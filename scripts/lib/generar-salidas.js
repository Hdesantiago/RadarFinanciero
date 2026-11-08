// Generación de los archivos JSON estáticos que alimentan la PWA.
// Controla el tamaño: límite de noticias y de historial.

import fs from 'node:fs';
import path from 'node:path';

const MAX_NOTICIAS = 500;
const MAX_HISTORIAL_DIAS = 30;

export function limitarNoticias(noticias) {
  // Ordenar por fecha de publicación (más recientes primero) y limitar
  return [...noticias]
    .sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0))
    .slice(0, MAX_NOTICIAS);
}

export function generarNewsJson(noticias, { esDemostracion = false } = {}) {
  return {
    generadoEn: new Date().toISOString(),
    esDemostracion,
    avisoDemostracion: esDemostracion
      ? 'DATOS DE DEMOSTRACIÓN: registros de ejemplo para validar el diseño. No corresponden a noticias reales.'
      : null,
    total: noticias.length,
    noticias
  };
}

export function generarCountriesJson(noticias) {
  const mapa = new Map();
  for (const n of noticias) {
    const pais = n.country ?? 'Global';
    if (!mapa.has(pais)) {
      mapa.set(pais, { pais, region: n.region ?? null, total: 0, categorias: new Set(), ultimaNoticia: null });
    }
    const entrada = mapa.get(pais);
    entrada.total++;
    if (n.category) entrada.categorias.add(n.category);
    const fecha = n.publishedAt ?? n.collectedAt;
    if (!entrada.ultimaNoticia || new Date(fecha) > new Date(entrada.ultimaNoticia)) {
      entrada.ultimaNoticia = fecha;
    }
  }
  return {
    generadoEn: new Date().toISOString(),
    paises: [...mapa.values()]
      .map((p) => ({ ...p, categorias: [...p.categorias] }))
      .sort((a, b) => b.total - a.total)
  };
}

export function generarCategoriesJson(noticias) {
  const mapa = new Map();
  for (const n of noticias) {
    const cat = n.category ?? 'Sin categoría';
    mapa.set(cat, (mapa.get(cat) ?? 0) + 1);
  }
  return {
    generadoEn: new Date().toISOString(),
    categorias: [...mapa.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
  };
}

export function generarSourcesStatusJson(estados) {
  return {
    generadoEn: new Date().toISOString(),
    fuentes: estados
  };
}

export function generarLastUpdateJson(noticias, estados) {
  const exitosas = estados.filter((e) => e.estado === 'ok').length;
  const fallidas = estados.filter((e) => e.estado === 'error').length;
  return {
    ultimaActualizacion: new Date().toISOString(),
    totalNoticias: noticias.length,
    fuentesExitosas: exitosas,
    fuentesFallidas: fallidas,
    fuentesTotales: estados.length
  };
}

export function escribirJson(ruta, datos) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2) + '\n', 'utf8');
}

export function leerJsonSiExiste(ruta) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch {
    return null;
  }
}

// Fusiona noticias nuevas con el historial existente, sin duplicar y
// limitando el historial a los últimos N días.
export function fusionarConHistorial(noticiasNuevas, rutaHistorial) {
  const historial = leerJsonSiExiste(rutaHistorial)?.noticias ?? [];
  const limite = Date.now() - MAX_HISTORIAL_DIAS * 86400000;
  const historialReciente = historial.filter(
    (n) => new Date(n.publishedAt ?? n.collectedAt ?? 0).getTime() >= limite
  );
  const mapa = new Map();
  for (const n of [...historialReciente, ...noticiasNuevas]) {
    mapa.set(n.id, n); // las nuevas sobrescriben a las antiguas con mismo id
  }
  return [...mapa.values()];
}
