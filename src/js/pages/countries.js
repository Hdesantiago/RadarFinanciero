// Página: Expediente por país. Ficha con noticias, cronología y datos
// disponibles. No se inventan indicadores cuando faltan datos.

import { obtenerNoticias } from '../api/newsRepository.js';
import {
  establecerCatalogo, registrarNoticias, filtrarPorPais,
  ordenarPorFecha, resumirPorCategoria
} from '../services/newsService.js';
import { obtenerEstados } from '../services/offlineService.js';
import { crearTarjetaNoticia } from '../components/newsCard.js';
import { escapar, formatearFecha } from '../components/utils.js';

const PAISES_PRINCIPALES = [
  'Francia', 'Alemania', 'Japón', 'Estados Unidos', 'China',
  'Reino Unido', 'México', 'Brasil', 'Argentina'
];

function crearCronologia(noticias) {
  const ordenadas = ordenarPorFecha(noticias).slice(0, 20);
  if (!ordenadas.length) return '<p class="text-rf-muted">Sin noticias registradas.</p>';
  return `
    <div class="rf-cronologia">
      ${ordenadas
        .map(
          (n) => `
          <div class="rf-cronologia-item">
            <div class="rf-cronologia-fecha">${formatearFecha(n.publicadaEn)}</div>
            <div class="rf-cronologia-contenido">
              <button type="button" class="rf-card-titulo-btn" data-accion="detalle" data-id="${escapar(n.id)}">
                ${escapar(n.titulo)}
              </button>
              <small class="d-block text-rf-muted">${escapar(n.categoria ?? '')} · ${escapar(n.fuente ?? '')}</small>
            </div>
          </div>`
        )
        .join('')}
    </div>`;
}

async function pintarExpediente(pais) {
  const zona = document.querySelector('#rfExpedientePais');
  if (!zona) return;

  const { noticias } = await obtenerNoticias();
  establecerCatalogo(noticias);
  const delPais = filtrarPorPais(noticias, pais);
  registrarNoticias(delPais);
  const estados = await obtenerEstados(delPais.map((n) => n.id));
  const categorias = resumirPorCategoria(delPais);

  if (!delPais.length) {
    zona.innerHTML = `
      <div class="rf-vacio">
        <i class="bi bi-flag" aria-hidden="true"></i>
        <h2 class="h5 mt-3">Sin noticias de ${escapar(pais)}</h2>
        <p>No hay noticias registradas para este país en el catálogo actual.</p>
      </div>`;
    return;
  }

  zona.innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-6 col-md-3">
        <div class="card rf-card rf-stat"><div class="card-body">
          <div class="rf-stat-valor">${delPais.length}</div>
          <div class="rf-stat-etiqueta">Noticias</div>
        </div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card rf-card rf-stat"><div class="card-body">
          <div class="rf-stat-valor">${categorias.length}</div>
          <div class="rf-stat-etiqueta">Categorías</div>
        </div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card rf-card rf-stat"><div class="card-body">
          <div class="rf-stat-valor">${delPais.filter((n) => n.pocoDifundida).length}</div>
          <div class="rf-stat-etiqueta">Poco difundidas</div>
        </div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card rf-card rf-stat"><div class="card-body">
          <div class="rf-stat-valor rf-stat-valor-sm">${formatearFecha(ordenarPorFecha(delPais)[0]?.publicadaEn)}</div>
          <div class="rf-stat-etiqueta">Última noticia</div>
        </div></div>
      </div>
    </div>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <h3 class="rf-seccion-titulo mb-3"><i class="bi bi-bar-chart" aria-hidden="true"></i> Categorías</h3>
        <div class="d-flex flex-wrap gap-2">
          ${categorias.map((c) => `<span class="rf-chip-pais">${escapar(c.categoria)} <span class="rf-chip-conteo">${c.total}</span></span>`).join('')}
        </div>
      </div>
    </div>

    <div class="card rf-card mb-3">
      <div class="card-body">
        <h3 class="rf-seccion-titulo mb-3"><i class="bi bi-clock-history" aria-hidden="true"></i> Cronología</h3>
        ${crearCronologia(delPais)}
      </div>
    </div>

    <h3 class="rf-seccion-titulo mb-3"><i class="bi bi-newspaper" aria-hidden="true"></i> Noticias</h3>
    <div class="row g-3">
      ${delPais
        .map(
          (n) => `
          <div class="col-12 col-md-6 rf-col-noticia">
            ${crearTarjetaNoticia(n, { ...estados.get(n.id), contexto: 'catalogo' })}
          </div>`
        )
        .join('')}
    </div>`;
}

export async function renderPaises(contenedor) {
  const { noticias } = await obtenerNoticias();
  establecerCatalogo(noticias);
  const paisesConDatos = [...new Set(noticias.map((n) => n.pais).filter(Boolean))];
  const todosLosPaises = [...new Set([...PAISES_PRINCIPALES, ...paisesConDatos])].sort((a, b) =>
    a.localeCompare(b, 'es')
  );

  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-flag" aria-hidden="true"></i> Países</h1>
      <p class="text-rf-muted">Expedientes por país con cronología y datos disponibles.</p>
    </header>
    <div class="card rf-card mb-3">
      <div class="card-body">
        <label class="rf-filtro-label" for="rfSelectExpedientePais">Seleccionar país</label>
        <select id="rfSelectExpedientePais" class="form-select">
          <option value="">— Elegir país —</option>
          ${todosLosPaises
            .map((p) => `<option value="${escapar(p)}">${escapar(p)}${paisesConDatos.includes(p) ? ` (${noticias.filter((n) => n.pais === p).length})` : ''}</option>`)
            .join('')}
        </select>
      </div>
    </div>
    <div id="rfExpedientePais">
      <div class="rf-vacio">
        <i class="bi bi-flag" aria-hidden="true"></i>
        <p class="mt-3">Selecciona un país para ver su expediente.</p>
      </div>
    </div>`;

  contenedor.querySelector('#rfSelectExpedientePais').addEventListener('change', (e) => {
    if (e.target.value) {
      pintarExpediente(e.target.value);
    }
  });
}
