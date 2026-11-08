// Servicio de noticias: operaciones de consulta, ordenamiento y resumen
// sobre los registros obtenidos del repositorio.

export function ordenarPorRelevancia(noticias) {
  return [...noticias].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
}

export function ordenarPorFecha(noticias) {
  return [...noticias].sort(
    (a, b) => new Date(b.publicadaEn).getTime() - new Date(a.publicadaEn).getTime()
  );
}

export function filtrarPorCategoria(noticias, categoria) {
  return noticias.filter((n) => n.categoria === categoria);
}

export function obtenerPocoDifundidas(noticias) {
  return ordenarPorRelevancia(noticias.filter((n) => n.pocoDifundida));
}

export function obtenerCrisis(noticias) {
  return ordenarPorRelevancia(
    noticias.filter((n) => (n.categoria ?? '').toLowerCase().includes('crisis'))
  );
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
