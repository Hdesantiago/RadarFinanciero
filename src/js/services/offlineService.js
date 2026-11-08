// Servicio offline: estado de conexión y disponibilidad local de noticias.
// Una noticia está "disponible sin conexión" cuando su resumen y metadatos
// están guardados en Favoritos o en Mi biblioteca (IndexedDB). Los artículos
// originales en sitios externos siempre requieren conexión: nunca se promete
// lectura offline de páginas de terceros.

import { esFavorito } from '../storage/favoritesRepository.js';
import { estaGuardada } from '../storage/savedNewsRepository.js';

export function estaEnLinea() {
  return navigator.onLine;
}

export async function obtenerEstadoNoticia(id) {
  const [favorita, guardada] = await Promise.all([esFavorito(id), estaGuardada(id)]);
  return { esFavorito: favorita, guardada, disponibleOffline: favorita || guardada };
}

export async function obtenerEstados(ids) {
  const entradas = await Promise.all(
    ids.map(async (id) => [id, await obtenerEstadoNoticia(id)])
  );
  return new Map(entradas);
}

export function alCambiarConexion(callback) {
  const notificar = () => callback(estaEnLinea());
  window.addEventListener('online', notificar);
  window.addEventListener('offline', notificar);
  return () => {
    window.removeEventListener('online', notificar);
    window.removeEventListener('offline', notificar);
  };
}
