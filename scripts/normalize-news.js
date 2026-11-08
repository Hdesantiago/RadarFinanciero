// Normalización de noticias: limpia campos, valida URLs y fechas,
// y asegura el esquema del modelo de noticia. Los campos desconocidos
// quedan en null. No se inventa información.

import {
  normalizarTexto, validarUrl, parsearFecha,
  detectarPais, regionDePais, clasificarCategoria,
  extraerPalabrasClave, extraerEntidades
} from './lib/procesar-noticia.js';

const CAMPOS_MODELO = [
  'id', 'title', 'originalTitle', 'summary', 'originalDescription',
  'sourceName', 'sourceUrl', 'publishedAt', 'collectedAt',
  'country', 'region', 'category', 'language', 'keywords', 'entities',
  'reliability', 'relevanceScore', 'isUnderreported', 'relatedEventId'
];

export function normalizarNoticia(n) {
  const title = normalizarTexto(n.title);
  const sourceUrl = validarUrl(n.sourceUrl);
  if (!title || !sourceUrl) return null; // descartar registros sin título o URL válida

  const summary = normalizarTexto(n.summary) || null;
  const texto = `${title} ${summary ?? ''}`;
  const country = n.country ?? detectarPais(texto);

  const normalizada = {
    id: n.id,
    title,
    originalTitle: normalizarTexto(n.originalTitle) || title,
    summary,
    originalDescription: normalizarTexto(n.originalDescription) || summary,
    sourceName: normalizarTexto(n.sourceName) || null,
    sourceUrl,
    publishedAt: parsearFecha(n.publishedAt),
    collectedAt: n.collectedAt ?? new Date().toISOString(),
    country,
    region: n.region ?? regionDePais(country),
    category: n.category ?? clasificarCategoria(texto),
    language: n.language ?? null,
    keywords: Array.isArray(n.keywords) && n.keywords.length ? n.keywords : extraerPalabrasClave(texto),
    entities: Array.isArray(n.entities) && n.entities.length ? n.entities : extraerEntidades(texto),
    reliability: n.reliability ?? null,
    relevanceScore: typeof n.relevanceScore === 'number' ? n.relevanceScore : null,
    isUnderreported: Boolean(n.isUnderreported),
    relatedEventId: n.relatedEventId ?? null
  };

  // Asegurar que solo existan los campos del modelo
  const limpia = {};
  for (const campo of CAMPOS_MODELO) {
    limpia[campo] = normalizada[campo] ?? null;
  }
  return limpia;
}

export function normalizarLote(noticias) {
  const validas = [];
  const descartadas = [];
  for (const n of noticias) {
    const normalizada = normalizarNoticia(n);
    if (normalizada) {
      validas.push(normalizada);
    } else {
      descartadas.push({ id: n?.id ?? null, motivo: 'sin título o URL válida' });
    }
  }
  return { validas, descartadas };
}
