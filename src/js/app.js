// Punto de entrada de RADAR FINANCIERO.

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';
import '../assets/css/styles.css';
import '../assets/css/responsive.css';

import { APP } from './config.js';
import { renderNavegacion, marcarActivo } from './components/navigation.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNoticias } from './pages/news.js';
import { renderCrisis } from './pages/crisis.js';
import { renderPaises } from './pages/countries.js';
import { renderInvestigaciones } from './pages/research.js';
import { renderFavoritos } from './pages/favorites.js';
import { renderBiblioteca } from './pages/biblioteca.js';
import { renderConfiguracion } from './pages/configuracion.js';
import { renderPlaceholder } from './pages/placeholder.js';
import { inicializarAccionesNoticias } from './components/newsActions.js';

const RUTAS = {
  dashboard: renderDashboard,
  noticias: renderNoticias,
  radar: (c) =>
    renderPlaceholder(c, {
      titulo: 'Noticias poco difundidas',
      icono: 'bi-broadcast-pin',
      descripcion: 'Acontecimientos detectados por UNDERREPORTED RADAR con puntuación explicable.',
      fase: 5
    }),
  crisis: renderCrisis,
  paises: renderPaises,
  investigaciones: renderInvestigaciones,
  favoritos: renderFavoritos,
  biblioteca: renderBiblioteca,
  configuracion: renderConfiguracion
};

function renderEstructura() {
  document.querySelector('#app').innerHTML = `
    <nav class="navbar rf-topbar fixed-top">
      <div class="container-fluid">
        <button class="btn rf-btn-icono d-lg-none" type="button" data-bs-toggle="offcanvas"
                data-bs-target="#rfSidebar" aria-controls="rfSidebar" aria-label="Abrir menú">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
        <a class="navbar-brand rf-brand" href="#/dashboard">
          <i class="bi bi-broadcast" aria-hidden="true"></i> ${APP.nombre}
        </a>
        <div class="d-flex align-items-center gap-2">
          <span id="rfEstadoConexion" class="badge rf-badge-online" role="status">
            <i class="bi bi-wifi" aria-hidden="true"></i> En línea
          </span>
          <button id="rfBotonInstalar" class="btn rf-btn-instalar d-none" type="button">
            <i class="bi bi-download" aria-hidden="true"></i> Instalar
          </button>
        </div>
      </div>
    </nav>

    <div class="offcanvas-lg offcanvas-start rf-sidebar" tabindex="-1" id="rfSidebar"
         aria-labelledby="rfSidebarLabel">
      <div class="offcanvas-header d-lg-none">
        <span class="rf-brand" id="rfSidebarLabel">
          <i class="bi bi-broadcast" aria-hidden="true"></i> ${APP.nombre}
        </span>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                data-bs-target="#rfSidebar" aria-label="Cerrar menú"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column p-0" id="rfMenu"></div>
    </div>

    <main class="rf-main" id="rfMain" tabindex="-1"></main>

    <nav class="rf-bottomnav d-lg-none" id="rfBottomNav" aria-label="Navegación inferior"></nav>`;
}

function enrutar() {
  const id = location.hash.replace(/^#\//, '') || 'dashboard';
  const render = RUTAS[id] ?? RUTAS.dashboard;
  const contenedor = document.querySelector('#rfMain');
  marcarActivo(RUTAS[id] ? id : 'dashboard');
  render(contenedor);
  contenedor.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
}

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((error) => console.error('[app] Error al registrar el Service Worker:', error));
  });
}

function configurarInstalacion() {
  let eventoInstalacion = null;
  const boton = document.querySelector('#rfBotonInstalar');

  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalacion = evento;
    boton?.classList.remove('d-none');
  });

  boton?.addEventListener('click', async () => {
    if (!eventoInstalacion) {
      return;
    }
    eventoInstalacion.prompt();
    await eventoInstalacion.userChoice;
    eventoInstalacion = null;
    boton.classList.add('d-none');
  });

  window.addEventListener('appinstalled', () => {
    boton?.classList.add('d-none');
  });
}

function configurarEstadoConexion() {
  const indicador = document.querySelector('#rfEstadoConexion');
  const actualizar = () => {
    const enLinea = navigator.onLine;
    indicador.className = `badge ${enLinea ? 'rf-badge-online' : 'rf-badge-offline'}`;
    indicador.innerHTML = enLinea
      ? '<i class="bi bi-wifi" aria-hidden="true"></i> En línea'
      : '<i class="bi bi-wifi-off" aria-hidden="true"></i> Sin conexión';
  };
  window.addEventListener('online', actualizar);
  window.addEventListener('offline', actualizar);
  actualizar();
}

renderEstructura();
renderNavegacion();
inicializarAccionesNoticias();
enrutar();
window.addEventListener('hashchange', enrutar);
registrarServiceWorker();
configurarInstalacion();
configurarEstadoConexion();
