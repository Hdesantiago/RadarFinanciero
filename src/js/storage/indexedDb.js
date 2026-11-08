// FASE 2 — Capa de almacenamiento local con IndexedDB.
// Esquema planificado (versión 1). No utilizar localStorage para grandes
// volúmenes de información. Cada usuario conserva su propio almacenamiento
// local independiente; los datos no se comparten entre dispositivos.

export const DB_NAME = 'radar-financiero';
export const DB_VERSION = 1;

export const STORES = {
  FAVORITOS: 'favoritos',
  BIBLIOTECA: 'biblioteca',
  HISTORIAL: 'historial-lectura',
  INVESTIGACIONES: 'investigaciones',
  PREFERENCIAS: 'preferencias',
  PAISES_SEGUIDOS: 'paises-seguidos',
  DATOS_DESCARGADOS: 'datos-descargados'
};
