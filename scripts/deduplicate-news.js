// Deduplicación y agrupación de noticias relacionadas.
// - Deduplicación: por URL canónica y por similitud de título.
// - Agrupación: noticias con título muy similar o mismo país+categoría+fecha
//   se agrupan bajo un relatedEventId compartido.

function canonizarUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    u.hostname = u.hostname.replace(/^www\./, '');
    return u.href.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function normalizarTitulo(titulo) {
  return (titulo ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function similitudTitulo(a, b) {
  const ta = new Set(normalizarTitulo(a).split(' ').filter((w) => w.length > 3));
  const tb = new Set(normalizarTitulo(b).split(' ').filter((w) => w.length > 3));
  if (!ta.size || !tb.size) return 0;
  const interseccion = [...ta].filter((w) => tb.has(w)).length;
  return interseccion / Math.max(ta.size, tb.size);
}

export function deduplicar(noticias) {
  const porUrl = new Map();
  const duplicados = [];

  for (const n of noticias) {
    const clave = canonizarUrl(n.sourceUrl);
    if (porUrl.has(clave)) {
      duplicados.push({ id: n.id, motivo: 'URL duplicada', conservado: porUrl.get(clave).id });
      continue;
    }
    porUrl.set(clave, n);
  }

  const unicas = [...porUrl.values()];
  const finales = [];
  const grupos = new Map(); // relatedEventId -> [ids]

  for (const n of unicas) {
    let asignada = false;
    for (const f of finales) {
      const sim = similitudTitulo(n.title, f.title);
      const mismoContexto =
        n.country && f.country && n.country === f.country &&
        n.category && f.category && n.category === f.category;
      if (sim >= 0.6 || (sim >= 0.4 && mismoContexto)) {
        // Agrupar: asignar relatedEventId compartido
        const eventoId = f.relatedEventId ?? f.id;
        f.relatedEventId = eventoId;
        n.relatedEventId = eventoId;
        if (!grupos.has(eventoId)) grupos.set(eventoId, []);
        grupos.get(eventoId).push(n.id);
        asignada = true;
        break;
      }
    }
    finales.push(n);
    if (!asignada && !n.relatedEventId) {
      n.relatedEventId = null;
    }
  }

  return { noticias: finales, duplicados, grupos };
}
