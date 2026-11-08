# Documentación de fuentes

RADAR FINANCIERO recopila información financiera internacional exclusivamente
de **APIs públicas** y **feeds RSS oficiales o autorizados**. El catálogo
completo está en [`public/data/sources.json`](../public/data/sources.json).

## Fuentes objetivo

| ID | Fuente | Tipo | Región | Confiabilidad |
|----|--------|------|--------|----------------|
| `gdelt` | GDELT Project | API pública | Global | Media |
| `fmi` | Fondo Monetario Internacional | RSS oficial | Global | Alta |
| `banco-mundial` | Banco Mundial | RSS oficial | Global | Alta |
| `bis` | Bank for International Settlements | RSS oficial | Global | Alta |
| `bce` | Banco Central Europeo | RSS oficial | Zona euro | Alta |
| `eurostat` | Eurostat | API pública | Unión Europea | Alta |
| `banxico` | Banco de México | RSS oficial | México | Alta |
| `fed` | Reserva Federal de EE. UU. | RSS oficial | Estados Unidos | Alta |
| `us-treasury` | Departamento del Tesoro de EE. UU. | RSS oficial | Estados Unidos | Alta |
| `sec` | SEC | RSS oficial | Estados Unidos | Alta |
| `calificadoras` | Agencias de calificación (información pública) | Comunicados | Global | Alta |
| `medios-especializados` | Medios económicos con RSS autorizado | RSS | Global | Media |

## Reglas de uso

- **Sin claves privadas en el navegador.** Ninguna API que requiera secretos
  se consulta desde el frontend.
- **Sin proxies CORS públicos.** Las fuentes que no permiten solicitudes
  directas desde el navegador se recopilan en **GitHub Actions** (FASE 3) y
  se publican como `data/news.json` estático.
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
  "estado": "Activa | Pendiente de activación | Excluida"
}
```
