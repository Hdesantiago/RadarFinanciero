# Documentación PWA

RADAR FINANCIERO es una Progressive Web App instalable en Android, iPhone,
Windows y macOS.

## Componentes

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Web App Manifest | `public/manifest.webmanifest` | Nombre, iconos, colores, `start_url` y `scope` relativos |
| Service Worker | `public/sw.js` | Caché del app shell, caché de datos y página offline |
| Página offline | `public/offline.html` | Respaldo cuando no hay conexión |
| Iconos | `public/icons/` | 192×192, 512×512 y maskable (generados con `npm run generate:icons`) |

## Estrategia de caché

- **App shell y recursos estáticos** (`index.html`, CSS, JS, iconos):
  *cache-first* con actualización en segundo plano.
- **Datos** (`data/news.json`, `data/sources.json`): *network-first* con
  respaldo en caché para lectura sin conexión.
- **Navegación**: *network-first*; sin conexión se sirve el app shell en
  caché o `offline.html`.
- Las versiones de caché se invalidan al cambiar `VERSION` en `sw.js`.

## Instalación

- **Android (Chrome/Edge)**: menú ⋮ → *Instalar aplicación* / *Agregar a
  pantalla de inicio*. Si el navegador lo soporta, la app muestra un botón
  **Instalar** en la barra superior.
- **iPhone (Safari)**: botón *Compartir* → *Agregar a pantalla de inicio*.
- **Windows / macOS (Chrome/Edge)**: icono de instalación en la barra de
  direcciones o menú → *Instalar RADAR FINANCIERO*.

## Alcance del modo offline

- ✅ Abrir la aplicación y consultar el catálogo de noticias en caché
  (`data/news.json`, network-first con respaldo).
- ✅ Favoritos, Mi biblioteca, historial de lectura, investigaciones
  guardadas, países seguidos y ajustes (IndexedDB, desde la FASE 2).
- ✅ El detalle de una noticia indica si el resumen está guardado y
  disponible offline, o si el contenido podría no estarlo.
- ❌ Los artículos originales en sitios externos **requieren conexión**;
  la app nunca promete lectura offline de páginas de terceros.

## Actualización de recursos

Al publicarse una nueva versión, el Service Worker se actualiza
automáticamente (`skipWaiting` + `clients.claim`) y elimina las cachés
obsoletas durante la activación.
