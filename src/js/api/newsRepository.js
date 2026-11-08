// Repositorio de noticias: lee el archivo estático data/news.json publicado
// junto con la aplicación (generado por GitHub Actions a partir de la FASE 3).
// En FASE 1 el archivo contiene datos de demostración claramente identificados.

import { RUTAS_DATOS } from '../config.js';

export async function obtenerNoticias() {
  try {
    const respuesta = await fetch(RUTAS_DATOS.noticias, { cache: 'no-cache' });
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    return {
      noticias: Array.isArray(datos.noticias) ? datos.noticias : [],
      generadoEn: datos.generadoEn ?? null,
      esDemostracion: Boolean(datos.esDemostracion),
      avisoDemostracion: datos.avisoDemostracion ?? null,
      error: null
    };
  } catch (error) {
    console.error('[newsRepository] No se pudieron cargar las noticias:', error);
    return {
      noticias: [],
      generadoEn: null,
      esDemostracion: false,
      avisoDemostracion: null,
      error: 'No fue posible cargar las noticias. Se reintentará al recuperar la conexión.'
    };
  }
}
