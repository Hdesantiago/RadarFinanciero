// Parser RSS 2.0 / Atom sin dependencias externas.
// Extrae título, enlace, descripción, fecha y categorías de cada ítem.

function decodificarEntidades(texto) {
  if (!texto) return '';
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function extraerTexto(xml, etiqueta) {
  // CDATA
  const cdata = new RegExp(`<${etiqueta}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${etiqueta}>`, 'i').exec(xml);
  if (cdata) return decodificarEntidades(cdata[1].trim());
  // Texto plano
  const plano = new RegExp(`<${etiqueta}[^>]*>([\\s\\S]*?)</${etiqueta}>`, 'i').exec(xml);
  if (plano) return decodificarEntidades(plano[1].replace(/<[^>]+>/g, '').trim());
  return '';
}

function extraerEnlaceAtom(itemXml) {
  // <link href="..." /> o <link>texto</link>
  const href = /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i.exec(itemXml);
  if (href) return href[1];
  return extraerTexto(itemXml, 'link');
}

function limpiarHtml(html) {
  if (!html) return '';
  return decodificarEntidades(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function parsearRss(xml) {
  const items = [];
  // RSS 2.0: <item>...</item>
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  for (const itemXml of rssItems) {
    items.push({
      titulo: extraerTexto(itemXml, 'title'),
      enlace: extraerTexto(itemXml, 'link'),
      descripcion: limpiarHtml(extraerTexto(itemXml, 'description')),
      fecha: extraerTexto(itemXml, 'pubDate') || extraerTexto(itemXml, 'dc:date') || extraerTexto(itemXml, 'date'),
      categorias: (itemXml.match(/<category[^>]*>([\s\S]*?)<\/category>/gi) ?? []).map((c) =>
        decodificarEntidades(c.replace(/<[^>]+>/g, '').trim())
      ),
      guid: extraerTexto(itemXml, 'guid')
    });
  }
  // Atom: <entry>...</entry>
  const atomEntries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const entryXml of atomEntries) {
    items.push({
      titulo: extraerTexto(entryXml, 'title'),
      enlace: extraerEnlaceAtom(entryXml),
      descripcion: limpiarHtml(extraerTexto(entryXml, 'summary') || extraerTexto(entryXml, 'content')),
      fecha: extraerTexto(entryXml, 'published') || extraerTexto(entryXml, 'updated'),
      categorias: (entryXml.match(/<category[^>]+term=["']([^"']+)["'][^>]*\/?>/gi) ?? []).map((c) =>
        /<category[^>]+term=["']([^"']+)["']/i.exec(c)?.[1] ?? ''
      ),
      guid: extraerTexto(entryXml, 'id')
    });
  }
  return items.filter((i) => i.titulo && i.enlace);
}
