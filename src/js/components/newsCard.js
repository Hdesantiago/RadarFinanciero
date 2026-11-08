// Tarjeta de noticia reutilizable.

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function claseRelevancia(valor) {
  if (valor >= 80) return 'rf-relevancia-alta';
  if (valor >= 60) return 'rf-relevancia-media';
  return 'rf-relevancia-baja';
}

export function crearTarjetaNoticia(noticia) {
  const relevancia = Math.round(noticia.relevancia ?? 0);
  const enlaceFuente =
    noticia.url && noticia.url !== '#'
      ? `<a href="${escapar(noticia.url)}" target="_blank" rel="noopener noreferrer" class="rf-enlace-fuente">
           Leer en la fuente <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
         </a>`
      : '<span class="text-rf-muted">Enlace no disponible (demo)</span>';

  return `
    <article class="card rf-card h-100">
      <div class="card-body d-flex flex-column">
        <div class="d-flex flex-wrap gap-1 mb-2">
          <span class="badge rf-badge-categoria">${escapar(noticia.categoria)}</span>
          <span class="badge rf-badge-pais"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapar(noticia.pais)}</span>
          ${noticia.pocoDifundida ? '<span class="badge rf-badge-radar"><i class="bi bi-broadcast-pin" aria-hidden="true"></i> Poco difundida</span>' : ''}
          ${noticia.esDemo ? '<span class="badge rf-badge-demo">DEMO</span>' : ''}
        </div>
        <h3 class="rf-card-title">${escapar(noticia.titulo)}</h3>
        <p class="rf-card-resumen">${escapar(noticia.resumen)}</p>
        <div class="rf-relevancia ${claseRelevancia(relevancia)}" title="Puntuación de relevancia (0-100)">
          <div class="d-flex justify-content-between">
            <small>Relevancia</small>
            <small><strong>${relevancia}</strong>/100</small>
          </div>
          <div class="rf-relevancia-barra">
            <div class="rf-relevancia-valor" style="width: ${Math.min(100, Math.max(0, relevancia))}%"></div>
          </div>
        </div>
        ${noticia.motivoSeleccion ? `<p class="rf-motivo"><i class="bi bi-info-circle" aria-hidden="true"></i> ${escapar(noticia.motivoSeleccion)}</p>` : ''}
        <div class="rf-card-footer mt-auto">
          <small class="text-rf-muted">
            <i class="bi bi-newspaper" aria-hidden="true"></i> ${escapar(noticia.fuente)} ·
            <i class="bi bi-clock" aria-hidden="true"></i> ${formatearFecha(noticia.publicadaEn)}
          </small>
          ${enlaceFuente}
        </div>
      </div>
    </article>`;
}
