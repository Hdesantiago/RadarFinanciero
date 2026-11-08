// Diálogo de confirmación reutilizable (modal de Bootstrap).
// confirmarEliminacion respeta el ajuste "confirmarEliminaciones" del
// usuario (Configuración → Preferencias).

import { Modal } from 'bootstrap';
import { obtenerAjuste } from '../storage/settingsRepository.js';

let modalEl = null;
let resolver = null;

function construirModal() {
  if (modalEl) {
    return modalEl;
  }
  modalEl = document.createElement('div');
  modalEl.className = 'modal fade rf-modal';
  modalEl.tabIndex = -1;
  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title fs-6" data-rf-titulo></h2>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body" data-rf-mensaje></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-light btn-sm" data-bs-dismiss="modal" data-rf-cancelar></button>
          <button type="button" class="btn btn-danger btn-sm" data-rf-confirmar></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modalEl);
  modalEl.querySelector('[data-rf-confirmar]').addEventListener('click', () => {
    Modal.getInstance(modalEl)?.hide();
    resolver?.(true);
    resolver = null;
  });
  modalEl.addEventListener('hidden.bs.modal', () => {
    resolver?.(false);
    resolver = null;
  });
  return modalEl;
}

export function confirmar({
  titulo = 'Confirmar',
  mensaje = '',
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar'
} = {}) {
  const el = construirModal();
  el.querySelector('[data-rf-titulo]').textContent = titulo;
  el.querySelector('[data-rf-mensaje]').textContent = mensaje;
  el.querySelector('[data-rf-confirmar]').textContent = textoConfirmar;
  el.querySelector('[data-rf-cancelar]').textContent = textoCancelar;
  return new Promise((resolve) => {
    resolver = resolve;
    Modal.getOrCreateInstance(el).show();
  });
}

export async function confirmarEliminacion(mensaje) {
  const activa = await obtenerAjuste('confirmarEliminaciones', true);
  if (!activa) {
    return true;
  }
  return confirmar({ titulo: 'Confirmar eliminación', mensaje });
}
