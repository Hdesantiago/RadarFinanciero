// Utilidades de procesamiento: normalización, detección de país,
// clasificación temática, validación de URL y control de fechas.

import { TEMAS_BUSQUEDA, PAISES_PALABRAS, REGION_POR_PAIS } from '../config/search-topics.js';

// Genera un id estable a partir de la URL (hash simple, sin dependencias).
export function generarId(url, titulo = '') {
  const base = `${url}|${titulo}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const c = base.charCodeAt(i);
    hash = ((hash << 5) - hash + c) | 0;
  }
  return `n-${Math.abs(hash).toString(36)}`;
}

export function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

export function validarUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return u.href;
  } catch {
    return null;
  }
}

export function parsearFecha(valor) {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  // Rechazar fechas futuras lejanas (más de 1 día) o muy antiguas (antes de 2000)
  const ahora = Date.now();
  if (fecha.getTime() > ahora + 86400000) return null;
  if (fecha.getTime() < new Date('2000-01-01').getTime()) return null;
  return fecha.toISOString();
}

export function detectarPais(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();
  for (const [pais, palabras] of Object.entries(PAISES_PALABRAS)) {
    if (palabras.some((p) => t.includes(p))) {
      return pais;
    }
  }
  return null;
}

export function regionDePais(pais) {
  return REGION_POR_PAIS[pais] ?? null;
}

export function clasificarCategoria(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase();
  let mejor = null;
  let mejorPuntaje = 0;
  for (const tema of TEMAS_BUSQUEDA) {
    const puntaje = tema.palabrasClave.filter((p) => t.includes(p.toLowerCase())).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = tema.categoria;
    }
  }
  return mejor;
}

export function extraerPalabrasClave(texto, max = 8) {
  if (!texto) return [];
  const t = texto.toLowerCase();
  const encontradas = new Set();
  for (const tema of TEMAS_BUSQUEDA) {
    for (const palabra of tema.palabrasClave) {
      if (t.includes(palabra.toLowerCase())) {
        encontradas.add(palabra);
        if (encontradas.size >= max) return [...encontradas];
      }
    }
  }
  return [...encontradas];
}

// Extrae entidades simples: países detectados y organismos mencionados.
export function extraerEntidades(texto) {
  if (!texto) return [];
  const t = texto.toLowerCase();
  const entidades = new Set();
  const pais = detectarPais(texto);
  if (pais) entidades.add(pais);
  const organismos = [
    ['fmi', 'FMI'], ['fondo monetario', 'FMI'], ['banco mundial', 'Banco Mundial'],
    ['bis', 'BIS'], ['bce', 'BCE'], ['ecb', 'BCE'], ['federal reserve', 'Fed'],
    ['fed', 'Fed'], ['banxico', 'Banxico'], ['sec', 'SEC'], ['eurostat', 'Eurostat'],
    ['tesoro', 'Tesoro EE. UU.'], ['treasury', 'Tesoro EE. UU.']
  ];
  for (const [clave, nombre] of organismos) {
    if (t.includes(clave)) entidades.add(nombre);
  }
  return [...entidades];
}
