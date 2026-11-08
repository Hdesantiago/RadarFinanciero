// Notificaciones tipo toast, visibles también sobre la navegación inferior
// en teléfonos.

import { Toast } from 'bootstrap';

const ICONOS = {
  exito: 'bi-check-circle-fill',
  error: 'bi-x-octagon-fill',
  info: 'bi-info-circle-fill'
};

export function mostrarToast(mensaje, tipo = 'exito') {
  let contenedor = document.querySelector('#rfToasts');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'rfToasts';
    contenedor.className = 'rf-toasts toast-container';
    document.body.appendChild(contenedor);
  }
  const elemento = document.createElement('div');
  elemento.className = `toast rf-toast rf-toast-${tipo}`;
  elemento.setAttribute('role', 'status');
  elemento.innerHTML = `
    <div class="d-flex align-items-center gap-2 p-1">
      <i class="bi ${ICONOS[tipo] ?? ICONOS.info}" aria-hidden="true"></i>
      <div class="toast-body"></div>
      <button type="button" class="btn-close btn-close-white me-1" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
  elemento.querySelector('.toast-body').textContent = mensaje;
  contenedor.appendChild(elemento);
  const instancia = new Toast(elemento, { delay: 2800 });
  elemento.addEventListener('hidden.bs.toast', () => elemento.remove());
  instancia.show();
}
