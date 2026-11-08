// Repositorio del historial de lectura (almacén "readingHistory").
// Registra las noticias consultadas sin duplicados: una relectura actualiza
// la fecha (leidoEn) y el contador de lecturas del mismo registro.

import {
  STORES,
  guardarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos,
  limpiarAlmacen,
  registroDesdeNoticia
} from './indexedDb.js';

const ALMACEN = STORES.HISTORIAL;
const LIMITE_PREDETERMINADO = 50;

export async function registrarLectura(noticia) {
  const existente = await obtenerRegistro(ALMACEN, noticia.id);
  return guardarRegistro(ALMACEN, {
    ...registroDesdeNoticia(noticia),
    leidoEn: new Date().toISOString(),
    lecturas: (existente?.lecturas ?? 0) + 1
  });
}

export async function obtenerHistorial(limite = LIMITE_PREDETERMINADO) {
  const registros = await obtenerTodos(ALMACEN);
  return registros
    .sort(
      (a, b) =>
        new Date(b.leidoEn ?? b.updatedAt).getTime() -
        new Date(a.leidoEn ?? a.updatedAt).getTime()
    )
    .slice(0, limite);
}

export async function eliminarDelHistorial(id) {
  return eliminarRegistro(ALMACEN, id);
}

export async function limpiarHistorial() {
  return limpiarAlmacen(ALMACEN);
}
