# Recopilador de noticias (FASE 3)

Motor automático que consulta fuentes públicas, normaliza, deduplica y genera
los archivos JSON estáticos que alimentan la PWA. Se ejecuta en **GitHub
Actions** cada 6 horas y también puede ejecutarse manualmente.

## Arquitectura

```
GitHub Actions (cada 6 h)
  └─► node scripts/collect-news.js
        ├─► GDELT DOC API (16 temas de búsqueda)
        ├─► RSS: BCE, Fed, SEC, BIS
        ├─► Normalización → modelo de noticia
        ├─► Deduplicación + agrupación de eventos
        ├─► Fusión con historial (máx. 30 días, 500 noticias)
        └─► Genera public/data/*.json
              └─► commit + push → GitHub Pages
```

## Archivos generados

| Archivo | Contenido |
|---------|-----------|
| `public/data/news.json` | Catálogo de noticias (máx. 500, últimos 30 días) |
| `public/data/countries.json` | Índice de países con conteo y categorías |
| `public/data/categories.json` | Índice de categorías con conteo |
| `public/data/sources-status.json` | Estado de cada fuente (OK/error, registros, última respuesta) |
| `public/data/last-update.json` | Marca de última actualización y totales |

## Modelo de noticia

Cada noticia incluye: `id`, `title`, `originalTitle`, `summary`,
`originalDescription`, `sourceName`, `sourceUrl`, `publishedAt`,
`collectedAt`, `country`, `region`, `category`, `language`, `keywords`,
`entities`, `reliability`, `relevanceScore`, `isUnderreported`,
`relatedEventId`.

Los campos desconocidos quedan en `null`. No se inventa información.

## Ejecución manual

```bash
# Local (requiere Node.js ≥ 20.19)
node scripts/collect-news.js

# Pruebas unitarias del recopilador
node scripts/test-collector.js
```

## Ejecución en GitHub Actions

El workflow [`.github/workflows/update-news.yml`](../.github/workflows/update-news.yml):

- Se ejecuta automáticamente cada 6 horas (`cron: '0 */6 * * *'`).
- Admite ejecución manual desde **Actions → Actualizar noticias financieras
  → Run workflow**.
- Instala Node.js 22, ejecuta `npm ci`, corre el recopilador, valida los
  JSON y publica los cambios solo si hay diferencias (`git diff`).
- Permisos mínimos: `contents: write`.
- Si una fuente falla, continúa con las demás; si todas fallan, conserva el
  catálogo anterior.

## Protección del catálogo

- Si una ejecución no obtiene ninguna noticia nueva y ya existe un
  `news.json` con contenido, **no se sobrescribe** el catálogo anterior.
- El historial se limita a los últimos **30 días** y **500 noticias** para
  no hacer crecer el repositorio indefinidamente.
- Las noticias que cada usuario guarda en Favoritos o Mi biblioteca
  permanecen en su IndexedDB local, independientemente del historial del
  catálogo.

## Fuentes y limitaciones

Ver [docs/fuentes.md](fuentes.md) para el detalle de cada fuente, su estado
de verificación y limitaciones conocidas.
