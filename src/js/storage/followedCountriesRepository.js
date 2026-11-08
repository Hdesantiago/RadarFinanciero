// Repositorio de países seguidos (almacén "followedCountries").
// El nombre del país actúa como identificador, evitando duplicados.

import {
  STORES,
  agregarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos
} from './indexedDb.js';

const ALMACEN = STORES.PAISES_SEGUIDOS;

export async function seguirPais(nombrePais) {
  const nombre = (nombrePais ?? '').trim();
  if (!nombre) {
    return { registro: null, agregado: false };
  }
  return agregarRegistro(ALMACEN, { id: nombre, nombre });
}

export async function dejarDeSeguirPais(nombrePais) {
  return eliminarRegistro(ALMACEN, nombrePais);
}

export async function obtenerPaisesSeguidos() {
  const paises = await obtenerTodos(ALMACEN);
  return paises.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function esPaisSeguido(nombrePais) {
  return Boolean(await obtenerRegistro(ALMACEN, nombrePais));
}
