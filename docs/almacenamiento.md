# Almacenamiento local (IndexedDB)

RADAR FINANCIERO utiliza **IndexedDB** para todo el almacenamiento local.
No se utiliza `localStorage` para grandes volúmenes de información, ni SQLite,
ni ningún backend. Los datos viven únicamente en el dispositivo del usuario y
**no se comparten entre dispositivos**.

## Base de datos

- **Nombre:** `RadarFinancieroDB`
- **Versión actual:** `1`
- **Capa de acceso:** [`src/js/storage/indexedDb.js`](../src/js/storage/indexedDb.js)

## Almacenes (object stores)

| Almacén | Repositorio | Contenido |
|---------|-------------|-----------|
| `favorites` | `favoritesRepository.js` | Noticias marcadas como favoritas |
| `savedNews` | `savedNewsRepository.js` | "Mi biblioteca": noticias guardadas para leer después |
| `readingHistory` | `historyRepository.js` | Historial de noticias consultadas (con contador de lecturas) |
| `savedInvestigations` | `investigationsRepository.js` | Investigaciones guardadas (creación en FASE 5) |
| `followedCountries` | `followedCountriesRepository.js` | Países seguidos por el usuario |
| `userSettings` | `settingsRepository.js` | Preferencias (p. ej. confirmación antes de eliminar) |

## Esquema de registro

Todos los registros incluyen:

```json
{
  "id": "identificador-unico (keyPath)",
  "createdAt": "ISO 8601 — fecha de creación",
  "updatedAt": "ISO 8601 — última actualización"
}
```

Las noticias guardadas (favoritos y biblioteca) almacenan únicamente
**metadatos y extractos permitidos** por las fuentes:

`titulo`, `resumen`, `fuente`, `url`, `publicadaEn`, `pais`, `categoria`,
`relevancia`, `pocoDifundida`, `motivoSeleccion`, `tipoContenido`, `esDemo`.

Nunca se almacena el artículo completo protegido por derechos de autor.

## Operaciones

Cada repositorio implementa: **crear, consultar, actualizar, eliminar y
buscar**, sobre las primitivas de `indexedDb.js`:

- `agregarRegistro` — crea sin duplicar (`add()`; si el id existe devuelve
  `{ agregado: false }` con el registro existente).
- `guardarRegistro` — crea o actualiza (`put()`) preservando `createdAt`.
- `obtenerRegistro` / `obtenerTodos` / `buscarRegistros` — consultas.
- `eliminarRegistro` / `limpiarAlmacen` / `borrarTodosLosDatos` — borrado.

## Versionado y migraciones

El versionado se controla con `DB_VERSION` y el evento `onupgradeneeded`:

- **v1:** creación de los seis almacenes con índices `createdAt` y
  `updatedAt`.
- Futuras migraciones se agregan como bloques `if (oldVersion < N) { ... }`
  dentro de `onupgradeneeded`, sin perder datos existentes.

## Disponibilidad offline

Favoritos, biblioteca, historial, investigaciones, países seguidos y ajustes
están disponibles **sin conexión** porque se leen directamente de IndexedDB.
El catálogo de noticias (`data/news.json`) lo respalda el Service Worker
(network-first con caché). Los artículos originales en sitios externos
siempre requieren conexión.
