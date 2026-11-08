// Componentes visuales del Dashboard.

import Chart from 'chart.js/auto';
import { crearTarjetaNoticia } from './newsCard.js';

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

export function crearBannerDemostracion(aviso) {
  return `
    <div class="alert rf-alert-demo d-flex align-items-start gap-2" role="status">
      <i class="bi bi-flask" aria-hidden="true"></i>
      <div>${escapar(aviso)}</div>
    </div>`;
}

export function crearEstadisticas({ totalNoticias, totalFuentes, totalPaises, actualizadaEn }) {
  const fecha = actualizadaEn
    ? new Date(actualizadaEn).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Sin datos';
  const items = [
    { icono: 'bi-newspaper', valor: totalNoticias, etiqueta: 'Noticias recientes' },
    { icono: 'bi-hdd-network', valor: totalFuentes, etiqueta: 'Fuentes registradas' },
    { icono: 'bi-flag', valor: totalPaises, etiqueta: 'Países bajo seguimiento' },
    { icono: 'bi-arrow-repeat', valor: fecha, etiqueta: 'Última actualización', pequeno: true }
  ];
  return `
    <div class="row g-3">
      ${items
        .map(
          (item) => `
          <div class="col-6 col-lg-3">
            <div class="card rf-card rf-stat h-100">
              <div class="card-body">
                <i class="bi ${item.icono} rf-stat-icono" aria-hidden="true"></i>
                <div class="rf-stat-valor ${item.pequeno ? 'rf-stat-valor-sm' : ''}">${escapar(String(item.valor))}</div>
                <div class="rf-stat-etiqueta">${escapar(item.etiqueta)}</div>
              </div>
            </div>
          </div>`
        )
        .join('')}
    </div>`;
}

export function crearSeccion({ titulo, icono, noticias, idAncla }) {
  if (!noticias.length) {
    return '';
  }
  return `
    <section class="rf-seccion" ${idAncla ? `id="${idAncla}"` : ''}>
      <div class="d-flex align-items-center gap-2 mb-3">
        <i class="bi ${icono} rf-seccion-icono" aria-hidden="true"></i>
        <h2 class="rf-seccion-titulo">${escapar(titulo)}</h2>
        <span class="badge rf-badge-conteo">${noticias.length}</span>
      </div>
      <div class="row g-3">
        ${noticias
          .map(
            (n) => `
            <div class="col-12 col-md-6 col-xl-4">
              ${crearTarjetaNoticia(n)}
            </div>`
          )
          .join('')}
      </div>
    </section>`;
}

export function crearPanelPaises(resumenPaises) {
  if (!resumenPaises.length) {
    return '';
  }
  return `
    <section class="rf-seccion">
      <div class="d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-flag rf-seccion-icono" aria-hidden="true"></i>
        <h2 class="rf-seccion-titulo">Países bajo seguimiento</h2>
      </div>
      <div class="card rf-card">
        <div class="card-body d-flex flex-wrap gap-2">
          ${resumenPaises
            .map(
              ({ pais, total }) => `
              <span class="rf-chip-pais">
                <i class="bi bi-geo-alt" aria-hidden="true"></i> ${escapar(pais)}
                <span class="rf-chip-conteo">${total}</span>
              </span>`
            )
            .join('')}
        </div>
      </div>
    </section>`;
}

export function crearPanelGrafica() {
  return `
    <section class="rf-seccion">
      <div class="d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-bar-chart rf-seccion-icono" aria-hidden="true"></i>
        <h2 class="rf-seccion-titulo">Noticias por categoría</h2>
      </div>
      <div class="card rf-card">
        <div class="card-body">
          <div class="rf-grafica-contenedor">
            <canvas id="rfGraficaCategorias" aria-label="Gráfica de noticias por categoría" role="img"></canvas>
          </div>
        </div>
      </div>
    </section>`;
}

export function inicializarGraficaCategorias(resumenCategorias) {
  const lienzo = document.querySelector('#rfGraficaCategorias');
  if (!lienzo || !resumenCategorias.length) {
    return;
  }
  new Chart(lienzo, {
    type: 'bar',
    data: {
      labels: resumenCategorias.map((r) => r.categoria),
      datasets: [
        {
          label: 'Noticias',
          data: resumenCategorias.map((r) => r.total),
          backgroundColor: 'rgba(240, 185, 11, 0.75)',
          borderColor: '#f0b90b',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131c30',
          titleColor: '#e6edf7',
          bodyColor: '#e6edf7',
          borderColor: '#22304d',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: '#8fa1bd', precision: 0 },
          grid: { color: 'rgba(34, 48, 77, 0.6)' }
        },
        y: {
          ticks: { color: '#8fa1bd', autoSkip: false },
          grid: { display: false }
        }
      }
    }
  });
}
