// Página: Noticias mundiales — centro de noticias con búsqueda global,
// filtros combinables y ordenamiento.

import { obtenerNoticias } from '../api/newsRepository.js';
import {
  establecerCatalogo, registrarNoticias, buscar,
  filtrarCombinado, ordenarPorFecha, ordenarPorRelevancia,
  obtenerPaisesUnicos, obtenerRegionesUnicas, obtenerFuentesUnicas, obtenerCategoriasUnicas
} from '../services/newsService.js';
import { obtenerEstados } from '../services/offlineService.js';
import { crearTarjetaNoticia } from '../components/newsCard.js';
import { crearPanelFiltros, leerFiltros, limpiarFiltros } from '../components/newsFilters.js';
import { escapar } from '../components/utils.js';

const estado = {
  termino: '',
  orden: 'fecha',
  filtros: {}
};

async function pintarLista() {
  const contenedor = document.querySelector('#rfListaNoticias');
  if (!contenedor) return;

  const { noticias, esDemostracion, avisoDemostracion, error } = await obtenerNoticias();
  establecerCatalogo(noticias);

  if (error) {
    contenedor.innerHTML = `<div class="alert rf-alert-error" role="alert"><i class="bi bi-wifi-off" aria-hidden="true"></i> ${error}</div>`;
    return;
  }

  let lista = buscar(noticias, estado.termino);
  lista = filtrarCombinado(lista, estado.filtros);
  lista = estado.orden === 'relevancia' ? ordenarPorRelevancia(lista) : ordenarPorFecha(lista);

  registrarNoticias(lista);
  const estados = await obtenerEstados(lista.map((n) => n.id));

  const contador = document.querySelector('#rfContadorNoticias');
  if (contador) {
    contador.textContent = `${lista.length} de ${noticias.length} noticias`;
  }

  const banner = document.querySelector('#rfBannerNoticias');
  if (banner) {
    banner.innerHTML = esDemostracion
      ? `<div class="alert rf-alert-demo d-flex align-items-start gap-2" role="status">
           <i class="bi bi-flask" aria-hidden="true"></i><div>${escapar(avisoDemostracion)}</div>
         </div>`
      : '';
  }

  if (!lista.length) {
    contenedor.innerHTML = `
      <div class="rf-vacio">
        <i class="bi bi-search" aria-hidden="true"></i>
        <h2 class="h5 mt-3">Sin resultados</h2>
        <p>No hay noticias que coincidan con la búsqueda y los filtros aplicados.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = `
    <div class="row g-3">
      ${lista
        .map(
          (n) => `
          <div class="col-12 col-md-6 col-xl-4 rf-col-noticia">
            ${crearTarjetaNoticia(n, { ...estados.get(n.id), contexto: 'catalogo' })}
          </div>`
        )
        .join('')}
    </div>`;
}

export async function renderNoticias(contenedor) {
  const { noticias } = await obtenerNoticias();
  establecerCatalogo(noticias);

  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-globe-americas" aria-hidden="true"></i> Noticias mundiales</h1>
      <p class="text-rf-muted">Búsqueda y filtrado de noticias financieras internacionales.</p>
    </header>
    <div id="rfBannerNoticias"></div>
    <div class="card rf-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-12 col-md-8">
            <label class="visually-hidden" for="rfBuscarNoticias">Buscar noticias</label>
            <input id="rfBuscarNoticias" type="search" class="form-control"
                   placeholder="Buscar por título, resumen, país, fuente, entidad o palabra clave…"
                   value="${escapar(estado.termino)}" />
          </div>
          <div class="col-12 col-md-4">
            <label class="visually-hidden" for="rfOrdenNoticias">Ordenar</label>
            <select id="rfOrdenNoticias" class="form-select">
              <option value="fecha">Más recientes primero</option>
              <option value="relevancia">Mayor relevancia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    ${crearPanelFiltros({
      paises: obtenerPaisesUnicos(noticias),
      regiones: obtenerRegionesUnicas(noticias),
      categorias: obtenerCategoriasUnicas(noticias),
      fuentes: obtenerFuentesUnicas(noticias),
      valores: estado.filtros
    })}
    <p class="text-rf-muted rf-contador mt-3" id="rfContadorNoticias"></p>
    <div id="rfListaNoticias"></div>`;

  contenedor.querySelector('#rfOrdenNoticias').value = estado.orden;

  contenedor.querySelector('#rfBuscarNoticias').addEventListener('input', (e) => {
    estado.termino = e.target.value;
    pintarLista();
  });
  contenedor.querySelector('#rfOrdenNoticias').addEventListener('change', (e) => {
    estado.orden = e.target.value;
    pintarLista();
  });

  const panelFiltros = contenedor.querySelector('.rf-filtros');
  panelFiltros.addEventListener('change', () => {
    estado.filtros = leerFiltros(contenedor);
    pintarLista();
  });
  contenedor.querySelector('#rfBtnLimpiarFiltros').addEventListener('click', () => {
    limpiarFiltros(contenedor);
    estado.filtros = {};
    pintarLista();
  });

  await pintarLista();
}
