# Documentación de fuentes

RADAR FINANCIERO recopila información financiera internacional exclusivamente
de **APIs públicas** y **feeds RSS oficiales o autorizados**. El catálogo
completo está en [`public/data/sources.json`](../public/data/sources.json).

> **Verificación:** las URLs siguientes fueron verificadas en noviembre de
> 2026. Solo se listan como "activas" las fuentes que respondieron
> correctamente sin clave de API.

## Fuentes activas (verificadas)

| ID | Fuente | URL del feed | Tipo | Región | Confiabilidad | Limitaciones |
|----|--------|--------------|------|--------|----------------|--------------|
| `gdelt` | GDELT Project | `https://api.gdeltproject.org/api/v2/doc/doc` | API pública (JSON) | Global | Media | Rate-limit agresivo (HTTP 429); reintentos con backoff |
| `bce` | Banco Central Europeo | `https://www.ecb.europa.eu/rss/press.html` | RSS 2.0 | Zona euro | Alta | Sin paginación; últimos comunicados |
| `fed` | Reserva Federal de EE. UU. | `https://www.federalreserve.gov/feeds/press_all.xml` | RSS 2.0 | Estados Unidos | Alta | Feed combinado de todos los comunicados |
| `sec` | SEC | `https://www.sec.gov/news/pressreleases.rss` | RSS 2.0 | Estados Unidos | Alta | Exige User-Agent identificable; rate limit 10 req/s |
| `bis` | Bank for International Settlements | `https://www.bis.org/rss.xml` | RSS 2.0 | Global | Alta | Feed genérico del sitio (no solo prensa) |

## Fuentes sin RSS público verificable

Las siguientes fuentes **no disponen de un feed RSS o API pública de
noticias accesible sin autenticación** en la fecha de verificación. Quedan
documentadas como no disponibles hasta que exista un endpoint estable:

| Fuente | Motivo | Alternativa |
|--------|--------|-------------|
| FMI | RSS discontinuado en el rediseño del sitio | Endpoint JSON propietario `imf.org/en/news/index.json` (no documentado como API formal) |
| Banco Mundial | Sitio migrado a AEM; sin RSS visible | API de datos abiertos `api.worldbank.org` (series estadísticas, no noticias) |
| Eurostat | RSS redirige a EU Login (ECAS) | API REST estadística pública (no es feed de noticias) |
| Banxico | Sin RSS público encontrado | SIE requiere token/API key |
| U.S. Treasury | Sin RSS visible en la página de prensa | — |

## Reglas de uso

- **Sin claves privadas en el navegador.** Ninguna API que requiera secretos
  se consulta desde el frontend.
- **Sin proxies CORS públicos.** Las fuentes se recopilan en **GitHub
  Actions** y se publican como `data/news.json` estático.
- **Sin contenido protegido.** Solo se almacenan metadatos, descripciones y
  extractos autorizados; siempre se enlaza a la fuente original.
- **Tolerancia a fallos.** El error de una fuente individual no detiene la
  recopilación del resto.
- Si una fuente requiere autenticación privada, se **excluye de la versión
  pública** hasta contar con una solución segura.

## Esquema de cada fuente

```json
{
  "id": "identificador-unico",
  "nombre": "Nombre de la fuente",
  "url": "https://...",
  "tipo": "API pública | RSS oficial | RSS autorizado | Comunicados públicos",
  "region": "País o región",
  "categorias": ["Categorías financieras asociadas"],
  "confiabilidad": "Alta | Media",
  "estado": "Activa | No disponible | Excluida"
}
```
