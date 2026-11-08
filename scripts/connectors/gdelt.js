// Conector GDELT DOC API 2.0 — fuente de descubrimiento.
// Documentación: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
// Endpoint: https://api.gdeltproject.org/api/v2/doc/doc
// Sin clave de API. Límite razonable: 1 petición por tema, maxrecords=50.

import { fetchJson } from '../lib/http-client.js';
import { TEMAS_BUSQUEDA } from '../config/search-topics.js';
import {
  generarId, normalizarTexto, validarUrl, parsearFecha,
  detectarPais, regionDePais, clasificarCategoria,
  extraerPalabrasClave, extraerEntidades
} from '../lib/procesar-noticia.js';

const FUENTE_ID = 'gdelt';
const BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const MAX_POR_TEMA = 25;
const TIMESPAN = '1d'; // últimas 24 horas

async function buscarTema(tema) {
  const params = new URLSearchParams({
    query: tema.consultaGdelt,
    mode: 'ArtList',
    maxrecords: String(MAX_POR_TEMA),
    format: 'json',
    timespan: TIMESPAN,
    sort: 'HybridRel'
  });
  const url = `${BASE}?${params}`;
  const datos = await fetchJson(url, { fuenteId: FUENTE_ID });
  const articulos = datos?.articles ?? [];
  const noticias = [];

  for (const art of articulos) {
    const urlValida = validarUrl(art.url);
    if (!urlValida) continue;
    const titulo = normalizarTexto(art.title);
    if (!titulo) continue;
    const texto = `${titulo} ${art.seendate ?? ''} ${art.domain ?? ''}`;
    const pais = tema.paisFijo ?? detectarPais(texto);
    noticias.push({
      id: generarId(urlValida, titulo),
      title: titulo,
      originalTitle: titulo,
      summary: null, // GDELT ArtList no devuelve resumen; se deja nulo
      originalDescription: null,
      sourceName: normalizarTexto(art.domain) || 'GDELT',
      sourceUrl: urlValida,
      publishedAt: parsearFecha(art.seendate),
      collectedAt: new Date().toISOString(),
      country: pais,
      region: regionDePais(pais),
      category: clasificarCategoria(texto) ?? tema.categoria,
      language: art.language ?? null,
      keywords: extraerPalabrasClave(texto),
      entities: extraerEntidades(texto),
      reliability: 'Media',
      relevanceScore: null, // se calcula en la fase de ranking
      isUnderreported: false,
      relatedEventId: null,
      _fuenteId: FUENTE_ID,
      _temaId: tema.id
    });
  }
  return noticias;
}

export async function recopilarGdelt() {
  const resultados = [];
  const errores = [];
  for (const tema of TEMAS_BUSQUEDA) {
    try {
      const noticias = await buscarTema(tema);
      resultados.push(...noticias);
    } catch (error) {
      errores.push({ fuente: FUENTE_ID, tema: tema.id, error: error.message });
      // Continuar con el siguiente tema aunque uno falle
    }
  }
  return { noticias: resultados, errores };
}
