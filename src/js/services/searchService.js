// Servicio de búsqueda global: texto libre sobre título, resumen, país,
// fuente, entidades y palabras clave. Optimizado para teléfonos.

import { buscar, filtrarCombinado, ordenarPorFecha, ordenarPorRelevancia } from './newsService.js';

export function buscarGlobal(noticias, termino, filtros = {}, orden = 'fecha') {
  let resultado = buscar(noticias, termino);
  resultado = filtrarCombinado(resultado, filtros);
  return orden === 'relevancia' ? ordenarPorRelevancia(resultado) : ordenarPorFecha(resultado);
}

export function sugerirTerminos(noticias, termino, limite = 6) {
  const t = (termino ?? '').trim().toLowerCase();
  if (!t || t.length < 2) return [];
  const sugerencias = new Set();
  for (const n of noticias) {
    for (const campo of [n.pais, n.fuente, n.categoria]) {
      if (campo && campo.toLowerCase().includes(t)) sugerencias.add(campo);
    }
    for (const e of n.entidades ?? []) {
      if (e.toLowerCase().includes(t)) sugerencias.add(e);
    }
    for (const k of n.palabrasClave ?? []) {
      if (k.toLowerCase().includes(t)) sugerencias.add(k);
    }
    if (sugerencias.size >= limite) return [...sugerencias].slice(0, limite);
  }
  return [...sugerencias].slice(0, limite);
}
