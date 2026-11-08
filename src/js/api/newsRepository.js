// Repositorio de noticias: lee el archivo estático data/news.json publicado
// junto con la aplicación (generado por GitHub Actions a partir de la FASE 3).
// En FASE 1 el archivo contiene datos de demostración claramente identificados.

import { RUTAS_DATOS } from '../config.js';

// Adapta el modelo del recopilador (FASE 3, campos en inglés) al modelo
// interno de la interfaz (campos en español). Mantiene compatibilidad con
// los datos de demostración de la FASE 1.
function adaptarNoticia(n) {
  return {
    id: n.id,
    titulo: n.titulo ?? n.title ?? '',
    resumen: n.resumen ?? n.summary ?? null,
    fuente: n.fuente ?? n.sourceName ?? null,
    url: n.url ?? n.sourceUrl ?? null,
    publicadaEn: n.publicadaEn ?? n.publishedAt ?? null,
    pais: n.pais ?? n.country ?? null,
    region: n.region ?? null,
    categoria: n.categoria ?? n.category ?? null,
    relevancia: n.relevancia ?? n.relevanceScore ?? null,
    pocoDifundida: n.pocoDifundida ?? n.isUnderreported ?? false,
    motivoSeleccion: n.motivoSeleccion ?? null,
    tipoContenido: n.tipoContenido ?? null,
    esDemo: n.esDemo ?? false,
    idioma: n.idioma ?? n.language ?? null,
    palabrasClave: n.palabrasClave ?? n.keywords ?? [],
    entidades: n.entidades ?? n.entities ?? [],
    eventoRelacionado: n.eventoRelacionado ?? n.relatedEventId ?? null
  };
}

export async function obtenerNoticias() {
  try {
    const respuesta = await fetch(RUTAS_DATOS.noticias, { cache: 'no-cache' });
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    const crudas = Array.isArray(datos.noticias) ? datos.noticias : [];
    return {
      noticias: crudas.map(adaptarNoticia),
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
