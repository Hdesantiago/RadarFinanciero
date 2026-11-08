// Conector RSS/Atom genérico para organismos oficiales y medios.
// Cada fuente se configura con: id, nombre, url del feed, región, categoría
// por defecto y confiabilidad. El parser extrae título, enlace, descripción
// y fecha; no se copia el artículo completo.

import { fetchTexto } from '../lib/http-client.js';
import { parsearRss } from '../lib/parse-rss.js';
import {
  generarId, normalizarTexto, validarUrl, parsearFecha,
  detectarPais, regionDePais, clasificarCategoria,
  extraerPalabrasClave, extraerEntidades
} from '../lib/procesar-noticia.js';

export async function recopilarRss(config) {
  const {
    id, nombre, url, region = null, categoriaDefecto = null,
    confiabilidad = 'Alta', paisFijo = null, maxItems = 30
  } = config;

  const xml = await fetchTexto(url, { fuenteId: id });
  const items = parsearRss(xml).slice(0, maxItems);
  const noticias = [];

  for (const item of items) {
    const urlValida = validarUrl(item.enlace);
    if (!urlValida) continue;
    const titulo = normalizarTexto(item.titulo);
    if (!titulo) continue;
    const resumen = normalizarTexto(item.descripcion) || null;
    const texto = `${titulo} ${resumen ?? ''} ${(item.categorias ?? []).join(' ')}`;
    const pais = paisFijo ?? detectarPais(texto);
    noticias.push({
      id: generarId(urlValida, titulo),
      title: titulo,
      originalTitle: titulo,
      summary: resumen,
      originalDescription: resumen,
      sourceName: nombre,
      sourceUrl: urlValida,
      publishedAt: parsearFecha(item.fecha),
      collectedAt: new Date().toISOString(),
      country: pais,
      region: region ?? regionDePais(pais),
      category: clasificarCategoria(texto) ?? categoriaDefecto,
      language: null,
      keywords: extraerPalabrasClave(texto),
      entities: extraerEntidades(texto),
      reliability: confiabilidad,
      relevanceScore: null,
      isUnderreported: false,
      relatedEventId: null,
      _fuenteId: id
    });
  }
  return { noticias, errores: [] };
}
