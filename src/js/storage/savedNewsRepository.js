// Repositorio de "Mi biblioteca" (almacén "savedNews" de RadarFinancieroDB).
// Guarda noticias para leer posteriormente con sus metadatos y extractos
// permitidos por las fuentes: título, resumen, fuente, URL original, fecha
// de publicación, país, categoría y fecha de guardado (createdAt).
// Nunca se almacena el contenido completo protegido por derechos de autor.

import {
  STORES,
  agregarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos,
  buscarRegistros,
  registroDesdeNoticia
} from './indexedDb.js';

const ALMACEN = STORES.BIBLIOTECA;

export async function guardarNoticia(noticia) {
  return agregarRegistro(ALMACEN, registroDesdeNoticia(noticia));
}

export async function eliminarGuardada(id) {
  return eliminarRegistro(ALMACEN, id);
}

export async function estaGuardada(id) {
  return Boolean(await obtenerRegistro(ALMACEN, id));
}

export async function obtenerGuardadas() {
  const guardadas = await obtenerTodos(ALMACEN);
  return guardadas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function buscarGuardadas(termino) {
  const t = (termino ?? '').trim().toLowerCase();
  if (!t) {
    return obtenerGuardadas();
  }
  return buscarRegistros(ALMACEN, (n) =>
    [n.titulo, n.resumen, n.fuente, n.pais, n.categoria].some((campo) =>
      (campo ?? '').toLowerCase().includes(t)
    )
  );
}
