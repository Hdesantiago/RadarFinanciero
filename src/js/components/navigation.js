// Navegación principal: menú lateral (escritorio / offcanvas móvil)
// y navegación inferior para teléfonos.

import { APP, MENU, MENU_INFERIOR } from '../config.js';

function elementoMenu(item) {
  return `
    <li class="nav-item">
      <a class="nav-link rf-menu-link" href="${item.ruta}" data-seccion="${item.id}">
        <i class="bi ${item.icono}" aria-hidden="true"></i>
        <span>${item.titulo}</span>
      </a>
    </li>`;
}

export function renderNavegacion() {
  const menuLateral = document.querySelector('#rfMenu');
  const menuInferior = document.querySelector('#rfBottomNav');

  if (menuLateral) {
    menuLateral.innerHTML = `
      <div class="rf-sidebar-header px-3 pt-3 pb-2">
        <span class="rf-brand"><i class="bi bi-broadcast" aria-hidden="true"></i> ${APP.nombre}</span>
        <small class="d-block text-rf-muted">${APP.subtitulo}</small>
      </div>
      <ul class="nav flex-column rf-menu">
        ${MENU.map(elementoMenu).join('')}
      </ul>
      <div class="rf-sidebar-footer px-3 py-3 mt-auto">
        <small class="text-rf-muted">v${APP.version} · Fase ${APP.fase}</small>
      </div>`;
  }

  if (menuInferior) {
    const items = MENU.filter((item) => MENU_INFERIOR.includes(item.id));
    menuInferior.innerHTML = items
      .map(
        (item) => `
        <a class="rf-bottom-link" href="${item.ruta}" data-seccion="${item.id}">
          <i class="bi ${item.icono}" aria-hidden="true"></i>
          <span>${item.tituloCorto ?? item.titulo.split(' ')[0]}</span>
        </a>`
      )
      .join('');
  }
}

export function marcarActivo(idSeccion) {
  document.querySelectorAll('[data-seccion]').forEach((enlace) => {
    enlace.classList.toggle('active', enlace.dataset.seccion === idSeccion);
  });
}
