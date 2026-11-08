// Repositorio de investigaciones guardadas (almacén "savedInvestigations").
// La creación de investigaciones llega en la FASE 5; este repositorio ya
// permite guardarlas, consultarlas (incluso sin conexión) y eliminarlas.

import {
  STORES,
  guardarRegistro,
  eliminarRegistro,
  obtenerRegistro,
  obtenerTodos
} from './indexedDb.js';

const ALMACEN = STORES.INVESTIGACIONES;

export async function guardarInvestigacion(investigacion) {
  const id =
    investigacion.id ??
    globalThis.crypto?.randomUUID?.() ??
    `inv-${Date.now()}`;
  return guardarRegistro(ALMACEN, {
    titulo: '',
    descripcion: '',
    noticiasIds: [],
    enlaces: [],
    ...investigacion,
    id
  });
}

export async function obtenerInvestigacion(id) {
  return obtenerRegistro(ALMACEN, id);
}

export async function obtenerInvestigaciones() {
  const investigaciones = await obtenerTodos(ALMACEN);
  return investigaciones.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function eliminarInvestigacion(id) {
  return eliminarRegistro(ALMACEN, id);
}
