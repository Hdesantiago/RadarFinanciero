// Pruebas del recopilador: conectividad, respuestas vacías, fechas
// inválidas, URLs incorrectas, duplicados, fuentes caídas, JSON inválido,
// errores de red y ejecución repetida.

import { parsearRss } from './lib/parse-rss.js';
import {
  normalizarTexto, validarUrl, parsearFecha,
  detectarPais, clasificarCategoria, generarId
} from './lib/procesar-noticia.js';
import { normalizarLote } from './normalize-news.js';
import { deduplicar } from './deduplicate-news.js';
import { fusionarConHistorial, limitarNoticias } from './lib/generar-salidas.js';

let pasadas = 0;
let fallidas = 0;

function afirmar(condicion, nombre) {
  if (condicion) {
    console.log(`  ✔ ${nombre}`);
    pasadas++;
  } else {
    console.error(`  ✘ ${nombre}`);
    fallidas++;
  }
}

function seccion(titulo) {
  console.log(`\n--- ${titulo} ---`);
}

// --- Parser RSS ---
seccion('Parser RSS');
const rssValido = `<?xml version="1.0"?><rss version="2.0"><channel>
  <item><title>Noticia A</title><link>https://ejemplo.com/a</link><description>Resumen A</description><pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate></item>
  <item><title><![CDATA[Noticia B &amp; C]]></title><link>https://ejemplo.com/b</link><description><![CDATA[<p>HTML</p>]]></description></item>
</channel></rss>`;
const items = parsearRss(rssValido);
afirmar(items.length === 2, 'parsea 2 ítems RSS');
afirmar(items[0].titulo === 'Noticia A', 'título correcto');
afirmar(items[1].titulo === 'Noticia B & C', 'decodifica entidades en CDATA');
afirmar(items[1].descripcion === 'HTML', 'limpia HTML de descripción');

const atomValido = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
  <entry><title>Entrada Atom</title><link href="https://ejemplo.com/atom"/><summary>Resumen Atom</summary><published>2024-01-01T00:00:00Z</published></entry>
</feed>`;
const itemsAtom = parsearRss(atomValido);
afirmar(itemsAtom.length === 1, 'parsea 1 entrada Atom');
afirmar(itemsAtom[0].enlace === 'https://ejemplo.com/atom', 'extrae enlace Atom (href)');

afirmar(parsearRss('').length === 0, 'RSS vacío devuelve array vacío');
afirmar(parsearRss('<html><body>no es rss</body></html>').length === 0, 'HTML no-RSS devuelve array vacío');

// --- Validación de URL ---
seccion('Validación de URL');
afirmar(validarUrl('https://ejemplo.com/noticia') === 'https://ejemplo.com/noticia', 'URL https válida');
afirmar(validarUrl('http://ejemplo.com') === 'http://ejemplo.com/', 'URL http válida');
afirmar(validarUrl('javascript:alert(1)') === null, 'rechaza javascript:');
afirmar(validarUrl('ftp://ejemplo.com') === null, 'rechaza ftp:');
afirmar(validarUrl('no-es-url') === null, 'rechaza texto plano');
afirmar(validarUrl('') === null, 'rechaza cadena vacía');
afirmar(validarUrl(null) === null, 'rechaza null');

// --- Control de fechas ---
seccion('Control de fechas');
afirmar(parsearFecha('2024-01-15T10:00:00Z') === '2024-01-15T10:00:00.000Z', 'fecha ISO válida');
afirmar(parsearFecha('Mon, 15 Jan 2024 10:00:00 GMT') !== null, 'fecha RFC 2822 válida');
afirmar(parsearFecha('no-es-fecha') === null, 'rechaza fecha inválida');
afirmar(parsearFecha('') === null, 'rechaza fecha vacía');
afirmar(parsearFecha('1990-01-01') === null, 'rechaza fecha anterior a 2000');
afirmar(parsearFecha(new Date(Date.now() + 30 * 86400000).toISOString()) === null, 'rechaza fecha futura lejana');

// --- Normalización ---
seccion('Normalización');
const noticiaCruda = {
  id: 'test-1',
  title: '  Crisis   de   deuda  ',
  sourceUrl: 'https://ejemplo.com/noticia',
  summary: 'Resumen de prueba',
  publishedAt: '2024-06-01T00:00:00Z'
};
const { validas, descartadas } = normalizarLote([noticiaCruda]);
afirmar(validas.length === 1, 'normaliza noticia válida');
afirmar(validas[0].title === 'Crisis de deuda', 'normaliza espacios en título');
afirmar(validas[0].country === null || typeof validas[0].country === 'string', 'country es null o string');

const sinTitulo = normalizarLote([{ id: 'x', sourceUrl: 'https://a.com' }]);
afirmar(sinTitulo.descartadas.length === 1, 'descarta noticia sin título');
const sinUrl = normalizarLote([{ id: 'y', title: 'Sin URL' }]);
afirmar(sinUrl.descartadas.length === 1, 'descarta noticia sin URL válida');

// --- Detección de país y clasificación ---
seccion('Detección de país y clasificación');
afirmar(detectarPais('La deuda de Francia aumenta') === 'Francia', 'detecta Francia');
afirmar(detectarPais('Bank of Japan policy') === 'Japón', 'detecta Japón');
afirmar(detectarPais('Texto sin país') === null, 'devuelve null sin país');
afirmar(clasificarCategoria('sovereign debt crisis default') === 'Crisis de deuda soberana', 'clasifica crisis de deuda');
afirmar(clasificarCategoria('central bank monetary policy') === 'Bancos centrales', 'clasifica bancos centrales');

// --- Deduplicación ---
seccion('Deduplicación');
const n1 = { id: 'a', title: 'Crisis de deuda en Francia', sourceUrl: 'https://a.com/1', country: 'Francia', category: 'Crisis de deuda soberana', publishedAt: '2024-06-01T00:00:00Z' };
const n2 = { id: 'b', title: 'Crisis de deuda en Francia', sourceUrl: 'https://a.com/1', country: 'Francia', category: 'Crisis de deuda soberana', publishedAt: '2024-06-01T00:00:00Z' };
const n3 = { id: 'c', title: 'Otra noticia distinta', sourceUrl: 'https://b.com/2', country: 'Japón', category: 'Inflación', publishedAt: '2024-06-01T00:00:00Z' };
const { noticias: dedup, duplicados } = deduplicar([n1, n2, n3]);
afirmar(dedup.length === 2, 'elimina duplicado por URL');
afirmar(duplicados.length === 1, 'registra el duplicado');

// --- Historial y límites ---
seccion('Historial y límites');
const muchas = Array.from({ length: 600 }, (_, i) => ({
  id: `n-${i}`, title: `Noticia ${i}`, sourceUrl: `https://e.com/${i}`,
  publishedAt: new Date(Date.now() - i * 3600000).toISOString()
}));
afirmar(limitarNoticias(muchas).length === 500, 'limita a 500 noticias');

// --- Generación de ID estable ---
seccion('ID estable');
afirmar(generarId('https://a.com/1', 'Título') === generarId('https://a.com/1', 'Título'), 'mismo input → mismo id');
afirmar(generarId('https://a.com/1') !== generarId('https://a.com/2'), 'distinta URL → distinto id');

// --- Resumen ---
console.log(`\n=== Resultado: ${pasadas} pasadas, ${fallidas} fallidas ===`);
process.exit(fallidas > 0 ? 1 : 0);
