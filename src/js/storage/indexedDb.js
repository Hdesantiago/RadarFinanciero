// Capa de almacenamiento local con IndexedDB.
// Base de datos: RadarFinancieroDB (versionada; ver docs/almacenamiento.md).
// Cada registro incluye: id, createdAt y updatedAt.
// No se utiliza localStorage para grandes volúmenes de información y cada
// usuario conserva su propio almacenamiento local independiente: los datos
// no se comparten entre dispositivos.

export const DB_NAME = 'RadarFinancieroDB';
export const DB_VERSION = 1;

export const STORES = {
  FAVORITOS: 'favorites',
  BIBLIOTECA: 'savedNews',
  HISTORIAL: 'readingHistory',
  INVESTIGACIONES: 'savedInvestigations',
  PAISES_SEGUIDOS: 'followedCountries',
  AJUSTES: 'userSettings'
};

let promesaDB = null;

export function abrirDB() {
  if (promesaDB) {
    return promesaDB;
  }
  promesaDB = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('IndexedDB no está disponible en este navegador.'));
      return;
    }
    const solicitud = indexedDB.open(DB_NAME, DB_VERSION);

    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;
      // Versión 1: creación de almacenes con índices por fecha.
      for (const nombre of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(nombre)) {
          const almacen = db.createObjectStore(nombre, { keyPath: 'id' });
          almacen.createIndex('createdAt', 'createdAt', { unique: false });
          almacen.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      }
      // Futuras migraciones: if (evento.oldVersion < 2) { ... }
    };

    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error);
    solicitud.onblocked = () =>
      reject(new Error('RadarFinancieroDB está bloqueada por otra pestaña abierta.'));
  });
  return promesaDB;
}

async function ejecutar(nombreAlmacen, modo, operacion) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(nombreAlmacen, modo);
    const almacen = tx.objectStore(nombreAlmacen);
    const peticion = operacion(almacen);
    tx.oncomplete = () => resolve(peticion?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function conMarcasDeTiempo(registro, esNuevo) {
  const ahora = new Date().toISOString();
  return {
    ...registro,
    createdAt: esNuevo ? ahora : (registro.createdAt ?? ahora),
    updatedAt: ahora
  };
}

// Crea un registro evitando duplicados: si el id ya existe, no hace nada.
export async function agregarRegistro(nombreAlmacen, registro) {
  const completo = conMarcasDeTiempo(registro, true);
  try {
    await ejecutar(nombreAlmacen, 'readwrite', (almacen) => almacen.add(completo));
    return { registro: completo, agregado: true };
  } catch (error) {
    if (error?.name === 'ConstraintError') {
      return { registro: await obtenerRegistro(nombreAlmacen, registro.id), agregado: false };
    }
    throw error;
  }
}

// Crea o actualiza un registro preservando su createdAt original.
export async function guardarRegistro(nombreAlmacen, registro) {
  const existente = await obtenerRegistro(nombreAlmacen, registro.id);
  const completo = conMarcasDeTiempo({ ...existente, ...registro }, !existente);
  await ejecutar(nombreAlmacen, 'readwrite', (almacen) => almacen.put(completo));
  return completo;
}

export async function obtenerRegistro(nombreAlmacen, id) {
  return ejecutar(nombreAlmacen, 'readonly', (almacen) => almacen.get(id));
}

export async function obtenerTodos(nombreAlmacen) {
  const resultado = await ejecutar(nombreAlmacen, 'readonly', (almacen) => almacen.getAll());
  return resultado ?? [];
}

export async function eliminarRegistro(nombreAlmacen, id) {
  return ejecutar(nombreAlmacen, 'readwrite', (almacen) => almacen.delete(id));
}

export async function limpiarAlmacen(nombreAlmacen) {
  return ejecutar(nombreAlmacen, 'readwrite', (almacen) => almacen.clear());
}

export async function contarRegistros(nombreAlmacen) {
  const resultado = await ejecutar(nombreAlmacen, 'readonly', (almacen) => almacen.count());
  return resultado ?? 0;
}

export async function buscarRegistros(nombreAlmacen, predicado) {
  return (await obtenerTodos(nombreAlmacen)).filter(predicado);
}

export async function borrarTodosLosDatos() {
  for (const nombre of Object.values(STORES)) {
    await limpiarAlmacen(nombre);
  }
}

// Convierte una noticia del catálogo en un registro almacenable con sus
// metadatos y extractos permitidos (nunca el artículo completo protegido).
export function registroDesdeNoticia(noticia) {
  return {
    id: noticia.id,
    titulo: noticia.titulo ?? '',
    resumen: noticia.resumen ?? '',
    fuente: noticia.fuente ?? '',
    url: noticia.url ?? '',
    publicadaEn: noticia.publicadaEn ?? null,
    pais: noticia.pais ?? '',
    categoria: noticia.categoria ?? '',
    relevancia: noticia.relevancia ?? null,
    pocoDifundida: Boolean(noticia.pocoDifundida),
    motivoSeleccion: noticia.motivoSeleccion ?? null,
    tipoContenido: noticia.tipoContenido ?? null,
    esDemo: Boolean(noticia.esDemo)
  };
}
