// Servicio de noticias: consulta, filtrado, ordenamiento, búsqueda y
// resumen sobre el catálogo. Mantiene el último catálogo disponible en
// memoria para funcionar sin conexión.

let catalogoCache = [];
let ultimaActualizacionCache = null;

export function establecerCatalogo(noticias, generadoEn = null) {
  catalogoCache = noticias ?? [];
  ultimaActualizacionCache = generadoEn;
}

export function obtenerCatalogo() {
  return catalogoCache;
}

export function obtenerUltimaActualizacion() {
  return ultimaActualizacionCache;
}

export function ordenarPorRelevancia(noticias) {
  return [...noticias].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
}

export function ordenarPorFecha(noticias) {
  return [...noticias].sort(
    (a, b) => new Date(b.publicadaEn ?? 0).getTime() - new Date(a.publicadaEn ?? 0).getTime()
  );
}

export function filtrarPorCategoria(noticias, categoria) {
  return noticias.filter((n) => n.categoria === categoria);
}

export function filtrarPorPais(noticias, pais) {
  return noticias.filter((n) => n.pais === pais);
}

export function filtrarPorRegion(noticias, region) {
  return noticias.filter((n) => n.region === region);
}

export function filtrarPorFuente(noticias, fuente) {
  return noticias.filter((n) => n.fuente === fuente);
}

export function filtrarPorFecha(noticias, desde, hasta) {
  return noticias.filter((n) => {
    const f = new Date(n.publicadaEn ?? 0).getTime();
    if (desde && f < new Date(desde).getTime()) return false;
    if (hasta && f > new Date(hasta).getTime() + 86399999) return false;
    return true;
  });
}

export function filtrarPorRelevanciaMinima(noticias, minima) {
  return noticias.filter((n) => (n.relevancia ?? 0) >= minima);
}

export function filtrarCombinado(noticias, { pais, region, categoria, fuente, desde, hasta, relevanciaMinima, palabrasClave } = {}) {
  let resultado = noticias;
  if (pais) resultado = filtrarPorPais(resultado, pais);
  if (region) resultado = filtrarPorRegion(resultado, region);
  if (categoria) resultado = filtrarPorCategoria(resultado, categoria);
  if (fuente) resultado = filtrarPorFuente(resultado, fuente);
  if (desde || hasta) resultado = filtrarPorFecha(resultado, desde, hasta);
  if (relevanciaMinima != null) resultado = filtrarPorRelevanciaMinima(resultado, relevanciaMinima);
  if (palabrasClave?.length) {
    resultado = resultado.filter((n) =>
      palabrasClave.some((pk) =>
        (n.palabrasClave ?? []).some((k) => k.toLowerCase().includes(pk.toLowerCase()))
      )
    );
  }
  return resultado;
}

export function buscar(noticias, termino) {
  const t = (termino ?? '').trim().toLowerCase();
  if (!t) return noticias;
  return noticias.filter((n) =>
    [n.titulo, n.resumen, n.pais, n.fuente, n.categoria]
      .some((campo) => (campo ?? '').toLowerCase().includes(t)) ||
    (n.entidades ?? []).some((e) => e.toLowerCase().includes(t)) ||
    (n.palabrasClave ?? []).some((k) => k.toLowerCase().includes(t))
  );
}

export function obtenerPocoDifundidas(noticias) {
  return ordenarPorRelevancia(noticias.filter((n) => n.pocoDifundida));
}

export function obtenerCrisis(noticias) {
  return ordenarPorRelevancia(
    noticias.filter((n) => (n.categoria ?? '').toLowerCase().includes('crisis'))
  );
}

export function obtenerDeudaSoberana(noticias) {
  return ordenarPorRelevancia(
    noticias.filter((n) =>
      ['crisis de deuda soberana', 'endeudamiento público', 'bonos soberanos'].includes(
        (n.categoria ?? '').toLowerCase()
      )
    )
  );
}

export function obtenerRelacionadas(noticias, noticia, limite = 4) {
  if (!noticia) return [];
  const relacionadas = noticias
    .filter((n) => n.id !== noticia.id)
    .map((n) => {
      let puntaje = 0;
      if (n.eventoRelacionado && n.eventoRelacionado === noticia.eventoRelacionado) puntaje += 10;
      if (n.categoria && n.categoria === noticia.categoria) puntaje += 3;
      if (n.pais && n.pais === noticia.pais) puntaje += 2;
      const palabrasComunes = (n.palabrasClave ?? []).filter((k) =>
        (noticia.palabrasClave ?? []).includes(k)
      ).length;
      puntaje += palabrasComunes;
      return { noticia: n, puntaje };
    })
    .filter((r) => r.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite)
    .map((r) => r.noticia);
  return relacionadas;
}

export function resumirPorCategoria(noticias) {
  const conteo = new Map();
  for (const n of noticias) {
    const categoria = n.categoria ?? 'Sin categoría';
    conteo.set(categoria, (conteo.get(categoria) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

export function resumirPorPais(noticias) {
  const conteo = new Map();
  for (const n of noticias) {
    const pais = n.pais ?? 'Global';
    conteo.set(pais, (conteo.get(pais) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([pais, total]) => ({ pais, total }))
    .sort((a, b) => b.total - a.total);
}

export function resumirPorFuente(noticias) {
  const conteo = new Map();
  for (const n of noticias) {
    const fuente = n.fuente ?? 'Desconocida';
    conteo.set(fuente, (conteo.get(fuente) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([fuente, total]) => ({ fuente, total }))
    .sort((a, b) => b.total - a.total);
}

export function obtenerPaisesUnicos(noticias) {
  return [...new Set(noticias.map((n) => n.pais).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function obtenerRegionesUnicas(noticias) {
  return [...new Set(noticias.map((n) => n.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function obtenerFuentesUnicas(noticias) {
  return [...new Set(noticias.map((n) => n.fuente).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

export function obtenerCategoriasUnicas(noticias) {
  return [...new Set(noticias.map((n) => n.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

// Registro en memoria de las noticias renderizadas, para resolver las
// acciones de las tarjetas (favorito, guardar, detalle) por identificador.
const registroNoticias = new Map();

export function registrarNoticias(lista) {
  for (const noticia of lista ?? []) {
    if (noticia?.id != null) {
      registroNoticias.set(String(noticia.id), noticia);
    }
  }
}

export function obtenerNoticiaPorId(id) {
  return registroNoticias.get(String(id)) ?? null;
}
