# RADAR FINANCIERO

**Inteligencia financiera internacional.**

Lector personal de noticias financieras internacionales con poca cobertura
mediática. Aplicación **100% frontend** (sin backend, sin servidores propios),
publicada gratuitamente en **GitHub Pages** e instalable como **PWA** en
Android, iPhone, Windows y macOS.

![Estado](https://img.shields.io/badge/fase-1-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

## Características

- 📡 **Radar de noticias** financieras internacionales.
- 🔎 **UNDERREPORTED RADAR**: detector de acontecimientos relevantes con poca
  difusión, con puntuación explicable de 0 a 100 (FASE 5).
- 🗂️ **20 categorías financieras**: crisis de deuda soberana, bancos
  centrales, inflación, bonos soberanos, devaluaciones, entre otras.
- 🌎 **Expedientes por país** con cronología (FASE 4/5).
- ⭐ **Favoritos y Mi biblioteca** con IndexedDB: guardar, buscar, ordenar y
  eliminar con confirmación; disponibles **sin conexión**.
- 📖 **Historial de lectura** y **países seguidos** en Configuración.
- 🔌 **Modo offline**: el detalle de cada noticia indica si el resumen está
  guardado en el dispositivo o si podría no estar disponible.
- 📤 **Compartir** vía Web Share API, X y WhatsApp (FASE 6).
- 🌙 Interfaz oscura tipo terminal financiera, responsive y Mobile First.
- ♿ Completamente en español.

## Arquitectura

```
GitHub Actions (cada 6 h) ──► data/news.json ──► GitHub Pages ──► PWA
   recopila, normaliza,          archivo estático      app estática   HTML·CSS·JS
   deduplica y clasifica                                (Vite build)   Bootstrap 5
```

- **Sin backend ni servidores propios.** El frontend lee `data/news.json`,
  generado por un proceso Node.js en GitHub Actions (FASE 3).
- **Sin secretos en el navegador.** Solo APIs públicas y RSS oficiales.
- **Almacenamiento local** con IndexedDB (`RadarFinancieroDB`, 6 almacenes
  versionados); nada se comparte entre dispositivos. Ver
  [docs/almacenamiento.md](docs/almacenamiento.md).

## Estructura del proyecto

```
├── public/
│   ├── icons/                  # Iconos PWA (generados)
│   ├── data/
│   │   ├── news.json           # Noticias (demo en FASE 1)
│   │   └── sources.json        # Catálogo de fuentes
│   ├── manifest.webmanifest
│   ├── offline.html
│   ├── sw.js                   # Service Worker
│   └── favicon.ico
├── src/
│   ├── assets/css/             # styles.css, responsive.css
│   └── js/
│       ├── app.js              # Punto de entrada, router, PWA
│       ├── config.js           # Configuración y categorías
│       ├── api/                # Repositorios de datos estáticos
│       ├── services/           # Lógica de negocio por fases
│       ├── storage/            # IndexedDB: RadarFinancieroDB (6 almacenes)
│       ├── components/         # Tarjetas, detalle, navegación, diálogos
│       └── pages/              # Vistas por módulo
├── scripts/                    # Recopilador Node.js (FASE 3) e iconos
├── docs/                       # Fuentes, PWA e instalación móvil
├── .github/workflows/          # Despliegue en GitHub Pages
├── index.html
├── package.json
└── vite.config.js
```

## Requisitos

- Node.js ≥ 20.19 y npm.

## Desarrollo local

```bash
git clone <url-del-repositorio>
cd <repositorio>
npm install
npm run dev
```

Abre <http://localhost:5173>.

## Compilación

```bash
npm run build     # Genera dist/
npm run preview   # Vista previa local de la compilación
```

`vite.config.js` usa `base: './'`, por lo que la compilación funciona en
cualquier subdirectorio de GitHub Pages sin ajustes.

## Publicación en GitHub Pages

1. Crea un repositorio **público** en GitHub y sube el código a la rama
   `main`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
3. El flujo [`deploy.yml`](.github/workflows/deploy.yml) compila y publica
   automáticamente en cada push a `main` (también admite ejecución manual).
4. La aplicación quedará disponible en
   `https://<usuario>.github.io/<repositorio>/`.

## Instalación de la PWA

Consulta la [guía de instalación móvil](docs/instalacion-movil.md) y la
[documentación PWA](docs/pwa.md).

## Fuentes de información

Solo APIs públicas y feeds RSS oficiales o autorizados (GDELT, FMI, Banco
Mundial, BIS, BCE, Eurostat, Banxico, Fed, Tesoro de EE. UU., SEC, entre
otros). Detalles en [docs/fuentes.md](docs/fuentes.md).

## Plan de desarrollo por fases

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Proyecto Vite, estructura, diseño, manifest, Service Worker, GitHub Pages, README | ✅ Completada |
| 2 | IndexedDB, favoritos, biblioteca, historial, modo offline | ✅ Completada |
| 3 | Recopilador Node.js, GDELT, RSS oficiales, `news.json`, Actions cada 6 h | ⏳ Pendiente |
| 4 | Dashboard completo, noticias, filtros, países, categorías, búsqueda | ⏳ Pendiente |
| 5 | UNDERREPORTED RADAR, agrupación, puntuación, cronologías | ⏳ Pendiente |
| 6 | Compartir (X, WhatsApp), experiencia móvil, pruebas, publicación | ⏳ Pendiente |

> **Nota (FASES 1-2):** las noticias mostradas son **datos de demostración
> claramente identificados** (insignia `DEMO` y aviso en el dashboard). No
> corresponden a acontecimientos reales. El recopilador automático llega en
> la FASE 3.

## Reglas del proyecto

- Sin backend, ASP.NET, SQL Server, SQLite ni servidores propios.
- Sin secretos ni API keys privadas en el código.
- No se inventan noticias ni indicadores; no se presentan predicciones como
  hechos; no se copian artículos protegidos: siempre se enlaza a la fuente.
- El fallo de una fuente individual no detiene la aplicación.

## Licencia

[MIT](LICENSE)
