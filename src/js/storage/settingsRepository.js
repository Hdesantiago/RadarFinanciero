// Repositorio de ajustes del usuario (almacén "userSettings").
// Cada ajuste es un registro { id: clave, valor, createdAt, updatedAt }.

import {
  STORES,
  guardarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos
} from './indexedDb.js';

const ALMACEN = STORES.AJUSTES;

export async function obtenerAjuste(clave, valorPredeterminado = null) {
  const registro = await obtenerRegistro(ALMACEN, clave);
  return registro ? registro.valor : valorPredeterminado;
}

export async function guardarAjuste(clave, valor) {
  return guardarRegistro(ALMACEN, { id: clave, valor });
}

export async function obtenerAjustes() {
  const registros = await obtenerTodos(ALMACEN);
  return Object.fromEntries(registros.map((r) => [r.id, r.valor]));
}

export async function eliminarAjuste(clave) {
  return eliminarRegistro(ALMACEN, clave);
}
