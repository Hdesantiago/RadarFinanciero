// Cliente HTTP con reintentos, timeout y manejo de errores por fuente.
// Diseñado para GitHub Actions (Node.js, sin dependencias externas).

const TIMEOUT_MS = 20000;
const MAX_REINTENTOS = 2;
// SEC exige un User-Agent identificable con contacto (sec.gov/os/webmaster-faq#developers).
const USER_AGENT = 'RadarFinanciero/1.0 (contacto: Hdesantiago@users.noreply.github.com)';

export class ErrorFuente extends Error {
  constructor(mensaje, fuenteId, causa = null) {
    super(mensaje);
    this.name = 'ErrorFuente';
    this.fuenteId = fuenteId;
    this.causa = causa;
  }
}

export async function fetchConReintentos(url, opciones = {}) {
  const { fuenteId = 'desconocida', reintentos = MAX_REINTENTOS, ...resto } = opciones;
  let ultimoError = null;

  for (let intento = 0; intento <= reintentos; intento++) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
    try {
      const respuesta = await fetch(url, {
        ...resto,
        signal: controlador.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*',
          ...resto.headers
        }
      });
      clearTimeout(temporizador);
      if (!respuesta.ok) {
        throw new ErrorFuente(`HTTP ${respuesta.status} ${respuesta.statusText}`, fuenteId);
      }
      return respuesta;
    } catch (error) {
      clearTimeout(temporizador);
      ultimoError = error;
      if (error.name === 'AbortError') {
        ultimoError = new ErrorFuente(`Timeout tras ${TIMEOUT_MS}ms`, fuenteId, error);
      } else if (!(error instanceof ErrorFuente)) {
        ultimoError = new ErrorFuente(error.message, fuenteId, error);
      }
      if (intento < reintentos) {
        const espera = 1000 * (intento + 1);
        await new Promise((r) => setTimeout(r, espera));
      }
    }
  }
  throw ultimoError;
}

export async function fetchTexto(url, opciones = {}) {
  const respuesta = await fetchConReintentos(url, opciones);
  return respuesta.text();
}

export async function fetchJson(url, opciones = {}) {
  const respuesta = await fetchConReintentos(url, opciones);
  return respuesta.json();
}
