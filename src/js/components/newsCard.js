// Tarjeta de noticia reutilizable con acciones: favorito, guardar en
// Mi biblioteca, ver detalle y (según el contexto) eliminar.

import { escapar, formatearFecha, claseRelevancia } from './utils.js';

export function crearTarjetaNoticia(noticia, opciones = {}) {
  const { esFavorito = false, guardada = false, contexto = 'catalogo' } = opciones;
  const relevancia = Math.round(noticia.relevancia ?? 0);
  const id = escapar(noticia.id);

  const enlaceFuente =
    noticia.url && noticia.url !== '#'
      ? `<a href="${escapar(noticia.url)}" target="_blank" rel="noopener noreferrer" class="rf-enlace-fuente">
           Leer en la fuente <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
         </a>`
      : '<span class="text-rf-muted">Enlace no disponible (demo)</span>';

  return `
    <article class="card rf-card h-100" data-noticia-id="${id}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex flex-wrap gap-1 mb-2">
          <span class="badge rf-badge-categoria">${escapar(noticia.categoria)}</span>
          <span class="badge rf-badge-pais"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapar(noticia.pais)}</span>
          ${noticia.pocoDifundida ? '<span class="badge rf-badge-radar"><i class="bi bi-broadcast-pin" aria-hidden="true"></i> Poco difundida</span>' : ''}
          ${guardada ? '<span class="badge rf-badge-guardada"><i class="bi bi-bookmark-check" aria-hidden="true"></i> Guardada</span>' : ''}
          ${noticia.esDemo ? '<span class="badge rf-badge-demo">DEMO</span>' : ''}
        </div>
        <h3 class="rf-card-title">
          <button type="button" class="rf-card-titulo-btn" data-accion="detalle" data-id="${id}">
            ${escapar(noticia.titulo)}
          </button>
        </h3>
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
        <div class="rf-card-acciones">
          <button type="button" class="rf-btn-tarjeta ${esFavorito ? 'active' : ''}"
                  data-accion="favorito" data-id="${id}" aria-pressed="${esFavorito}"
                  title="${esFavorito ? 'Quitar de Favoritos' : 'Marcar como favorita'}">
            <i class="bi ${esFavorito ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
          </button>
          <button type="button" class="rf-btn-tarjeta ${guardada ? 'rf-guardada-active' : ''}"
                  data-accion="guardar" data-id="${id}" aria-pressed="${guardada}"
                  title="${guardada ? 'Quitar de Mi biblioteca' : 'Guardar en Mi biblioteca'}">
            <i class="bi ${guardada ? 'bi-bookmark-fill' : 'bi-bookmark'}" aria-hidden="true"></i>
          </button>
          <button type="button" class="rf-btn-tarjeta rf-btn-detalle" data-accion="detalle" data-id="${id}" title="Ver detalle">
            <i class="bi bi-eye" aria-hidden="true"></i> Detalle
          </button>
          ${contexto === 'favoritos' ? `<button type="button" class="rf-btn-tarjeta rf-btn-peligro" data-accion="eliminar-favorito" data-id="${id}" title="Eliminar de Favoritos"><i class="bi bi-trash" aria-hidden="true"></i></button>` : ''}
          ${contexto === 'biblioteca' ? `<button type="button" class="rf-btn-tarjeta rf-btn-peligro" data-accion="eliminar-guardada" data-id="${id}" title="Eliminar de Mi biblioteca"><i class="bi bi-trash" aria-hidden="true"></i></button>` : ''}
        </div>
        <div class="rf-card-footer mt-auto">
          <small class="text-rf-muted">
            <i class="bi bi-newspaper" aria-hidden="true"></i> ${escapar(noticia.fuente)} ·
            <i class="bi bi-clock" aria-hidden="true"></i> ${formatearFecha(noticia.publicadaEn)}
          </small>
          ${contexto === 'biblioteca' && noticia.createdAt ? `<small class="text-rf-muted"><i class="bi bi-bookmark-check" aria-hidden="true"></i> Guardada el ${formatearFecha(noticia.createdAt)}</small>` : ''}
          ${enlaceFuente}
        </div>
      </div>
    </article>`;
}
