// Repositorio de fuentes: lee el catálogo estático data/sources.json.

import { RUTAS_DATOS } from '../config.js';

export async function obtenerFuentes() {
  try {
    const respuesta = await fetch(RUTAS_DATOS.fuentes, { cache: 'no-cache' });
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return {
      fuentes: Array.isArray(datos.fuentes) ? datos.fuentes : [],
      actualizadoEn: datos.actualizadoEn ?? null,
      error: null
    };
  } catch (error) {
    console.error('[sourcesRepository] No se pudieron cargar las fuentes:', error);
    return { fuentes: [], actualizadoEn: null, error: 'No fue posible cargar el catálogo de fuentes.' };
  }
}
