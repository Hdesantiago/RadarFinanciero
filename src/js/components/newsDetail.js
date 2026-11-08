// Vista de detalle de una noticia (modal). Registra la lectura en el
// historial e informa si el contenido está disponible sin conexión.

import { Modal } from 'bootstrap';
import { registrarLectura } from '../storage/historyRepository.js';
import { obtenerEstadoNoticia, estaEnLinea } from '../services/offlineService.js';
import { escapar, formatearFecha, claseRelevancia } from './utils.js';

let modalEl = null;

function construirModal() {
  if (modalEl) {
    return modalEl;
  }
  modalEl = document.createElement('div');
  modalEl.className = 'modal fade rf-modal';
  modalEl.tabIndex = -1;
  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title fs-5" data-rf-detalle-titulo></h2>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body" data-rf-detalle-cuerpo></div>
        <div class="modal-footer flex-wrap gap-2" data-rf-detalle-pie></div>
      </div>
    </div>`;
  document.body.appendChild(modalEl);
  return modalEl;
}

export async function abrirDetalleNoticia(noticia) {
  if (!noticia) {
    return;
  }
  try {
    await registrarLectura(noticia);
  } catch (error) {
    console.error('[newsDetail] No se pudo registrar la lectura:', error);
  }

  const estado = await obtenerEstadoNoticia(noticia.id);
  const enLinea = estaEnLinea();
  const relevancia = Math.round(noticia.relevancia ?? 0);
  const el = construirModal();

  el.querySelector('[data-rf-detalle-titulo]').textContent =
    noticia.titulo ?? 'Detalle de noticia';

  let avisoOffline = '';
  if (!enLinea) {
    avisoOffline = estado.disponibleOffline
      ? `<div class="rf-alert-offline rf-alert-offline-ok">
           <i class="bi bi-check-circle" aria-hidden="true"></i>
           Estás sin conexión: se muestra el resumen guardado en este dispositivo.
         </div>`
      : `<div class="rf-alert-offline">
           <i class="bi bi-wifi-off" aria-hidden="true"></i>
           Estás sin conexión y esta noticia no está guardada en este dispositivo:
           su contenido podría no estar disponible. Guarda las noticias en
           Favoritos o Mi biblioteca para leerlas offline.
         </div>`;
  }

  const enlaceFuente =
    noticia.url && noticia.url !== '#'
      ? enLinea
        ? `<a href="${escapar(noticia.url)}" target="_blank" rel="noopener noreferrer" class="btn rf-btn-instalar btn-sm">
             <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Leer en la fuente original
           </a>`
        : `<button type="button" class="btn btn-outline-secondary btn-sm" disabled>
             <i class="bi bi-wifi-off" aria-hidden="true"></i> Fuente original no disponible sin conexión
           </button>`
      : '<span class="text-rf-muted">Enlace no disponible (demo)</span>';

  el.querySelector('[data-rf-detalle-cuerpo]').innerHTML = `
    <div class="d-flex flex-wrap gap-1 mb-3">
      <span class="badge rf-badge-categoria">${escapar(noticia.categoria)}</span>
      <span class="badge rf-badge-pais"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapar(noticia.pais)}</span>
      ${noticia.pocoDifundida ? '<span class="badge rf-badge-radar"><i class="bi bi-broadcast-pin" aria-hidden="true"></i> Poco difundida</span>' : ''}
      ${estado.guardada ? '<span class="badge rf-badge-guardada"><i class="bi bi-bookmark-check" aria-hidden="true"></i> Guardada</span>' : ''}
      ${noticia.esDemo ? '<span class="badge rf-badge-demo">DEMO</span>' : ''}
    </div>
    ${avisoOffline}
    <p class="rf-detalle-resumen">${escapar(noticia.resumen)}</p>
    <div class="rf-relevancia ${claseRelevancia(relevancia)}">
      <div class="d-flex justify-content-between">
        <small>Relevancia</small>
        <small><strong>${relevancia}</strong>/100</small>
      </div>
      <div class="rf-relevancia-barra">
        <div class="rf-relevancia-valor" style="width: ${Math.min(100, Math.max(0, relevancia))}%"></div>
      </div>
    </div>
    ${noticia.motivoSeleccion ? `<p class="rf-motivo"><i class="bi bi-info-circle" aria-hidden="true"></i> ${escapar(noticia.motivoSeleccion)}</p>` : ''}
    <dl class="rf-detalle-meta">
      <div><dt>Fuente</dt><dd>${escapar(noticia.fuente)}</dd></div>
      <div><dt>Publicada</dt><dd>${formatearFecha(noticia.publicadaEn)}</dd></div>
      ${noticia.tipoContenido ? `<div><dt>Tipo de contenido</dt><dd>${escapar(noticia.tipoContenido)}</dd></div>` : ''}
    </dl>`;

  el.querySelector('[data-rf-detalle-pie]').innerHTML = `
    <button type="button" class="rf-btn-tarjeta ${estado.esFavorito ? 'active' : ''}"
            data-accion="favorito" data-id="${escapar(noticia.id)}" aria-pressed="${estado.esFavorito}">
      <i class="bi ${estado.esFavorito ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i> Favorita
    </button>
    <button type="button" class="rf-btn-tarjeta ${estado.guardada ? 'rf-guardada-active' : ''}"
            data-accion="guardar" data-id="${escapar(noticia.id)}" aria-pressed="${estado.guardada}">
      <i class="bi ${estado.guardada ? 'bi-bookmark-fill' : 'bi-bookmark'}" aria-hidden="true"></i> Mi biblioteca
    </button>
    ${enlaceFuente}`;

  Modal.getOrCreateInstance(el).show();
}
