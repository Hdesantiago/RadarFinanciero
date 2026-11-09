// Panel de filtros combinables para el centro de noticias.

import { escapar } from './utils.js';

export function crearPanelFiltros({ paises, regiones, categorias, fuentes, valores = {} }) {
  const opciones = (lista, valorActual, etiqueta) =>
    `<option value="">${etiqueta}</option>` +
    lista.map((v) => `<option value="${escapar(v)}" ${v === valorActual ? 'selected' : ''}>${escapar(v)}</option>`).join('');

  return `
    <div class="card rf-card rf-filtros">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroPais">País</label>
            <select id="rfFiltroPais" class="form-select form-select-sm">${opciones(paises, valores.pais, 'Todos')}</select>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroRegion">Región</label>
            <select id="rfFiltroRegion" class="form-select form-select-sm">${opciones(regiones, valores.region, 'Todas')}</select>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroCategoria">Categoría</label>
            <select id="rfFiltroCategoria" class="form-select form-select-sm">${opciones(categorias, valores.categoria, 'Todas')}</select>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroFuente">Fuente</label>
            <select id="rfFiltroFuente" class="form-select form-select-sm">${opciones(fuentes, valores.fuente, 'Todas')}</select>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroDesde">Desde</label>
            <input id="rfFiltroDesde" type="date" class="form-control form-control-sm" value="${escapar(valores.desde ?? '')}" />
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroHasta">Hasta</label>
            <input id="rfFiltroHasta" type="date" class="form-control form-control-sm" value="${escapar(valores.hasta ?? '')}" />
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <label class="rf-filtro-label" for="rfFiltroRelevancia">Relevancia mínima</label>
            <select id="rfFiltroRelevancia" class="form-select form-select-sm">
              <option value="">Cualquiera</option>
              <option value="50" ${valores.relevanciaMinima === 50 ? 'selected' : ''}>50+</option>
              <option value="70" ${valores.relevanciaMinima === 70 ? 'selected' : ''}>70+</option>
              <option value="85" ${valores.relevanciaMinima === 85 ? 'selected' : ''}>85+</option>
            </select>
          </div>
          <div class="col-6 col-md-4 col-lg-2 d-flex align-items-end">
            <button id="rfBtnLimpiarFiltros" type="button" class="btn btn-outline-light btn-sm w-100">
              <i class="bi bi-x-circle" aria-hidden="true"></i> Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

export function leerFiltros(contenedor) {
  const valor = (sel) => contenedor.querySelector(sel)?.value || null;
  const relevancia = valor('#rfFiltroRelevancia');
  return {
    pais: valor('#rfFiltroPais'),
    region: valor('#rfFiltroRegion'),
    categoria: valor('#rfFiltroCategoria'),
    fuente: valor('#rfFiltroFuente'),
    desde: valor('#rfFiltroDesde'),
    hasta: valor('#rfFiltroHasta'),
    relevanciaMinima: relevancia ? Number(relevancia) : null
  };
}

export function limpiarFiltros(contenedor) {
  for (const sel of ['#rfFiltroPais', '#rfFiltroRegion', '#rfFiltroCategoria', '#rfFiltroFuente', '#rfFiltroRelevancia']) {
    const el = contenedor.querySelector(sel);
    if (el) el.value = '';
  }
  for (const sel of ['#rfFiltroDesde', '#rfFiltroHasta']) {
    const el = contenedor.querySelector(sel);
    if (el) el.value = '';
  }
}
