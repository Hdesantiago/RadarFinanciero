// Página: Investigaciones guardadas en este dispositivo (IndexedDB).
// La creación de investigaciones llega en la FASE 5; aquí se consultan y
// eliminan, incluso sin conexión.

import {
  obtenerInvestigaciones,
  eliminarInvestigacion
} from '../storage/investigationsRepository.js';
import { confirmarEliminacion } from '../components/confirmDialog.js';
import { mostrarToast } from '../components/toast.js';
import { escapar, formatearFecha } from '../components/utils.js';

async function pintarLista() {
  const zona = document.querySelector('#rfListaInvestigaciones');
  if (!zona) {
    return;
  }
  const lista = await obtenerInvestigaciones();
  if (!lista.length) {
    zona.innerHTML = `
      <div class="card rf-card rf-placeholder">
        <div class="card-body text-center py-5">
          <i class="bi bi-journal-text rf-placeholder-icono" aria-hidden="true"></i>
          <h2 class="h5 mt-3">Aún no hay investigaciones guardadas</h2>
          <p class="text-rf-muted mb-0">
            El módulo de investigación financiera se implementará en la
            <strong>FASE 5</strong>. Las investigaciones que guardes estarán
            disponibles aquí, incluso sin conexión.
          </p>
        </div>
      </div>`;
    return;
  }
  zona.innerHTML = `
    <div class="row g-3">
      ${lista
        .map(
          (inv) => `
          <div class="col-12 col-md-6">
            <article class="card rf-card h-100">
              <div class="card-body">
                <h3 class="rf-card-title">${escapar(inv.titulo)}</h3>
                <p class="rf-card-resumen">${escapar(inv.descripcion)}</p>
                <small class="text-rf-muted">
                  Actualizada el ${formatearFecha(inv.updatedAt)} ·
                  ${(inv.noticiasIds ?? []).length} noticias vinculadas
                </small>
                <div class="rf-card-acciones">
                  <button type="button" class="rf-btn-tarjeta rf-btn-peligro"
                          data-inv-eliminar="${escapar(inv.id)}" title="Eliminar investigación">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </article>
          </div>`
        )
        .join('')}
    </div>`;
}

export async function renderInvestigaciones(contenedor) {
  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-journal-text" aria-hidden="true"></i> Investigaciones</h1>
      <p class="text-rf-muted">Investigaciones financieras guardadas en este dispositivo.</p>
    </header>
    <div id="rfListaInvestigaciones"></div>`;

  contenedor.querySelector('#rfListaInvestigaciones').addEventListener('click', async (e) => {
    const boton = e.target.closest('[data-inv-eliminar]');
    if (!boton) {
      return;
    }
    const confirmado = await confirmarEliminacion('¿Eliminar esta investigación guardada?');
    if (!confirmado) {
      return;
    }
    await eliminarInvestigacion(boton.dataset.invEliminar);
    mostrarToast('Investigación eliminada.', 'info');
    pintarLista();
  });

  await pintarLista();
}
