// Página: Configuración — preferencias, países seguidos, historial de
// lectura y administración de datos locales. Todo funciona sin conexión.

import { APP } from '../config.js';
import { obtenerNoticias } from '../api/newsRepository.js';
import { obtenerAjuste, guardarAjuste } from '../storage/settingsRepository.js';
import {
  obtenerHistorial,
  eliminarDelHistorial,
  limpiarHistorial
} from '../storage/historyRepository.js';
import {
  obtenerPaisesSeguidos,
  seguirPais,
  dejarDeSeguirPais
} from '../storage/followedCountriesRepository.js';
import { borrarTodosLosDatos } from '../storage/indexedDb.js';
import { registrarNoticias } from '../services/newsService.js';
import { confirmar, confirmarEliminacion } from '../components/confirmDialog.js';
import { mostrarToast } from '../components/toast.js';
import { escapar, formatearFecha } from '../components/utils.js';

async function pintarHistorial() {
  const zona = document.querySelector('#rfHistorial');
  if (!zona) {
    return;
  }
  const registros = await obtenerHistorial(50);
  registrarNoticias(registros);
  if (!registros.length) {
    zona.innerHTML = '<p class="text-rf-muted mb-0">Aún no has consultado noticias.</p>';
    return;
  }
  zona.innerHTML = `
    <ul class="rf-lista">
      ${registros
        .map(
          (n) => `
          <li class="rf-lista-item">
            <div>
              <button type="button" class="rf-card-titulo-btn" data-accion="detalle" data-id="${escapar(n.id)}">
                ${escapar(n.titulo)}
              </button>
              <small class="d-block text-rf-muted">
                ${escapar(n.fuente)} · ${formatearFecha(n.leidoEn ?? n.updatedAt)}${(n.lecturas ?? 1) > 1 ? ` · ${n.lecturas} lecturas` : ''}
              </small>
            </div>
            <button type="button" class="rf-btn-tarjeta rf-btn-peligro" data-historial-eliminar="${escapar(n.id)}"
                    title="Eliminar del historial">
              <i class="bi bi-trash" aria-hidden="true"></i>
            </button>
          </li>`
        )
        .join('')}
    </ul>`;
}

async function pintarPaises() {
  const zona = document.querySelector('#rfPaisesSeguidos');
  if (!zona) {
    return;
  }
  const seguidos = await obtenerPaisesSeguidos();
  zona.innerHTML = seguidos.length
    ? seguidos
        .map(
          (p) => `
          <span class="rf-chip-pais">
            <i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapar(p.nombre)}
            <button type="button" class="rf-chip-btn" data-pais-dejar="${escapar(p.nombre)}"
                    title="Dejar de seguir ${escapar(p.nombre)}">
              <i class="bi bi-x-circle" aria-hidden="true"></i>
            </button>
          </span>`
        )
        .join('')
    : '<p class="text-rf-muted mb-0">No sigues ningún país todavía.</p>';
}

async function pintarUso() {
  const zona = document.querySelector('#rfUsoDatos');
  if (!zona) {
    return;
  }
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(2);
    zona.textContent = `Espacio utilizado: ${mb(usage)} MB de ~${mb(quota)} MB disponibles en este dispositivo.`;
  } else {
    zona.textContent = 'Este navegador no reporta el uso de almacenamiento.';
  }
}

export async function renderConfiguracion(contenedor) {
  const confirmarActiva = await obtenerAjuste('confirmarEliminaciones', true);

  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-gear" aria-hidden="true"></i> Configuración</h1>
      <p class="text-rf-muted">Preferencias y datos locales de este dispositivo.</p>
    </header>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <h2 class="rf-seccion-titulo mb-3"><i class="bi bi-sliders" aria-hidden="true"></i> Preferencias</h2>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="rfPrefConfirmar"
                 ${confirmarActiva ? 'checked' : ''} />
          <label class="form-check-label" for="rfPrefConfirmar">
            Pedir confirmación antes de eliminar contenido
          </label>
        </div>
      </div>
    </div>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <h2 class="rf-seccion-titulo mb-3"><i class="bi bi-flag" aria-hidden="true"></i> Países seguidos</h2>
        <div id="rfPaisesSeguidos" class="d-flex flex-wrap gap-2 mb-3"></div>
        <div class="row g-2">
          <div class="col-12 col-sm-8">
            <label class="visually-hidden" for="rfSelectPais">País a seguir</label>
            <select id="rfSelectPais" class="form-select"></select>
          </div>
          <div class="col-12 col-sm-4">
            <button id="rfBtnSeguirPais" class="btn rf-btn-instalar w-100" type="button">
              <i class="bi bi-plus-lg" aria-hidden="true"></i> Seguir país
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <h2 class="rf-seccion-titulo mb-0"><i class="bi bi-clock-history" aria-hidden="true"></i> Historial de lectura</h2>
          <button id="rfBtnVaciarHistorial" class="btn btn-outline-danger btn-sm" type="button">
            <i class="bi bi-trash" aria-hidden="true"></i> Vaciar
          </button>
        </div>
        <div id="rfHistorial"></div>
      </div>
    </div>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <h2 class="rf-seccion-titulo mb-3"><i class="bi bi-hdd" aria-hidden="true"></i> Datos locales</h2>
        <p id="rfUsoDatos" class="text-rf-muted"></p>
        <p class="text-rf-muted">
          Favoritos, biblioteca, historial, investigaciones, países seguidos y
          ajustes se guardan únicamente en este dispositivo (IndexedDB) y no se
          comparten entre dispositivos.
        </p>
        <button id="rfBtnBorrarDatos" class="btn btn-outline-danger" type="button">
          <i class="bi bi-exclamation-triangle" aria-hidden="true"></i> Eliminar todos los datos locales
        </button>
      </div>
    </div>

    <div class="card rf-card">
      <div class="card-body">
        <h2 class="rf-seccion-titulo mb-3"><i class="bi bi-info-circle" aria-hidden="true"></i> Acerca de</h2>
        <p class="mb-1"><strong>${APP.nombre}</strong> — ${APP.subtitulo}</p>
        <p class="text-rf-muted mb-0">
          Versión ${APP.version} · Fase ${APP.fase} · Aplicación 100% frontend publicada en GitHub Pages.
        </p>
      </div>
    </div>`;

  contenedor.querySelector('#rfPrefConfirmar').addEventListener('change', async (e) => {
    await guardarAjuste('confirmarEliminaciones', e.target.checked);
    mostrarToast('Preferencia guardada.', 'exito');
  });

  const selectPais = contenedor.querySelector('#rfSelectPais');
  const { noticias } = await obtenerNoticias();
  const paises = [...new Set(noticias.map((n) => n.pais).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
  selectPais.innerHTML = paises.length
    ? paises.map((p) => `<option value="${escapar(p)}">${escapar(p)}</option>`).join('')
    : '<option value="">(Sin países disponibles)</option>';

  contenedor.querySelector('#rfBtnSeguirPais').addEventListener('click', async () => {
    const pais = selectPais.value;
    if (!pais) {
      return;
    }
    const { agregado } = await seguirPais(pais);
    mostrarToast(
      agregado ? `Ahora sigues a ${pais}.` : `${pais} ya estaba en tu lista.`,
      agregado ? 'exito' : 'info'
    );
    pintarPaises();
  });

  contenedor.querySelector('#rfPaisesSeguidos').addEventListener('click', async (e) => {
    const boton = e.target.closest('[data-pais-dejar]');
    if (!boton) {
      return;
    }
    await dejarDeSeguirPais(boton.dataset.paisDejar);
    mostrarToast('País eliminado de tu lista.', 'info');
    pintarPaises();
  });

  contenedor.querySelector('#rfHistorial').addEventListener('click', async (e) => {
    const boton = e.target.closest('[data-historial-eliminar]');
    if (!boton) {
      return;
    }
    const confirmado = await confirmarEliminacion('¿Eliminar este registro del historial?');
    if (!confirmado) {
      return;
    }
    await eliminarDelHistorial(boton.dataset.historialEliminar);
    mostrarToast('Registro eliminado del historial.', 'info');
    pintarHistorial();
  });

  contenedor.querySelector('#rfBtnVaciarHistorial').addEventListener('click', async () => {
    const confirmado = await confirmarEliminacion(
      'Se eliminará todo el historial de lectura.'
    );
    if (!confirmado) {
      return;
    }
    await limpiarHistorial();
    mostrarToast('Historial vaciado.', 'info');
    pintarHistorial();
  });

  contenedor.querySelector('#rfBtnBorrarDatos').addEventListener('click', async () => {
    const confirmado = await confirmar({
      titulo: 'Eliminar todos los datos',
      mensaje:
        'Se eliminarán favoritos, biblioteca, historial, investigaciones, países seguidos y ajustes de este dispositivo. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar todo'
    });
    if (!confirmado) {
      return;
    }
    await borrarTodosLosDatos();
    mostrarToast('Datos locales eliminados.', 'info');
    contenedor.querySelector('#rfPrefConfirmar').checked = true;
    pintarHistorial();
    pintarPaises();
    pintarUso();
  });

  await pintarHistorial();
  await pintarPaises();
  await pintarUso();
}
