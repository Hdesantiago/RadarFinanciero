// Repositorio de Favoritos (almacén "favorites" de RadarFinancieroDB).
// Marcar noticias como favoritas para consulta posterior, sin duplicados.

import {
  STORES,
  agregarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos,
  buscarRegistros,
  registroDesdeNoticia
} from './indexedDb.js';

const ALMACEN = STORES.FAVORITOS;

export async function agregarFavorito(noticia) {
  return agregarRegistro(ALMACEN, registroDesdeNoticia(noticia));
}

export async function eliminarFavorito(id) {
  return eliminarRegistro(ALMACEN, id);
}

export async function esFavorito(id) {
  return Boolean(await obtenerRegistro(ALMACEN, id));
}

export async function obtenerFavoritos() {
  const favoritos = await obtenerTodos(ALMACEN);
  return favoritos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function buscarFavoritos(termino) {
  const t = (termino ?? '').trim().toLowerCase();
  if (!t) {
    return obtenerFavoritos();
  }
  return buscarRegistros(ALMACEN, (n) =>
    [n.titulo, n.resumen, n.fuente, n.pais, n.categoria].some((campo) =>
      (campo ?? '').toLowerCase().includes(t)
    )
  );
}

// Marca o desmarca una noticia; devuelve el nuevo estado (true = favorita).
export async function alternarFavorito(noticia) {
  if (await esFavorito(noticia.id)) {
    await eliminarFavorito(noticia.id);
    return false;
  }
  await agregarFavorito(noticia);
  return true;
}
