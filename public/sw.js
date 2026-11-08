/*
 * RADAR FINANCIERO — Service Worker
 * Estrategia:
 *  - App shell y recursos estáticos: cache-first (con actualización en segundo plano).
 *  - Datos (data/news.json, data/sources.json): network-first con respaldo en caché.
 *  - Navegación: network-first con respaldo offline.
 * Nota: se sirve desde public/ para que Vite lo copie a la raíz del despliegue
 * y el alcance (scope) cubra todo el subdirectorio de GitHub Pages.
 */

const VERSION = 'v2';
const SHELL_CACHE = `rf-shell-${VERSION}`;
const DATA_CACHE = `rf-data-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Catálogo de noticias y fuentes: precargados para lectura offline desde la
// primera instalación y actualizados con estrategia network-first.
const DATOS_PRECACHE = ['./data/news.json', './data/sources.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => caches.open(DATA_CACHE))
      .then((cache) => cache.addAll(DATOS_PRECACHE))
      .catch((error) => console.warn('[sw] Precaché parcial:', error))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function cachePrimero(request) {
  const enCache = await caches.match(request, { ignoreSearch: true });
  if (enCache) {
    return enCache;
  }
  const respuesta = await fetch(request);
  if (respuesta.ok) {
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, respuesta.clone());
  }
  return respuesta;
}

async function redPrimero(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch (error) {
    const enCache = await cache.match(request, { ignoreSearch: true });
    if (enCache) {
      return enCache;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return; // No interceptar solicitudes a terceros.
  }

  // Datos de noticias y fuentes: red primero, caché como respaldo.
  if (url.pathname.includes('/data/')) {
    event.respondWith(redPrimero(request));
    return;
  }

  // Navegación: red primero; sin conexión, app shell o página offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const shell = await caches.match('./index.html');
        return shell || caches.match('./offline.html');
      })
    );
    return;
  }

  // Resto de recursos estáticos: caché primero.
  event.respondWith(cachePrimero(request));
});
