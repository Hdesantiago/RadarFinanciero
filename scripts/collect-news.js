/*
 * FASE 3 — Recopilador de noticias (se ejecuta en GitHub Actions cada 6 horas).
 *
 * Flujo planificado:
 *  1. Consultar APIs públicas y feeds RSS del catálogo data/sources.json.
 *  2. Extraer metadatos y descripciones disponibles.
 *  3. Normalizar registros (normalize-news.js).
 *  4. Eliminar duplicados (deduplicate-news.js).
 *  5. Clasificar por categoría financiera.
 *  6. Agrupar acontecimientos relacionados.
 *  7. Generar public/data/news.json e índices de países y categorías.
 *
 * Reglas: sin claves privadas, sin proxies CORS, manejar errores por fuente
 * sin detener todo el proceso, nunca inventar noticias.
 */

console.log('collect-news: disponible a partir de la FASE 3.');
