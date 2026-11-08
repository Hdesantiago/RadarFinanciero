// Página: Dashboard.

import { obtenerNoticias } from '../api/newsRepository.js';
import { obtenerFuentes } from '../api/sourcesRepository.js';
import {
  ordenarPorRelevancia,
  ordenarPorFecha,
  obtenerPocoDifundidas,
  obtenerCrisis,
  resumirPorCategoria,
  resumirPorPais
} from '../services/newsService.js';
import {
  crearBannerDemostracion,
  crearEstadisticas,
  crearSeccion,
  crearPanelPaises,
  crearPanelGrafica,
  inicializarGraficaCategorias
} from '../components/dashboard.js';

export async function renderDashboard(contenedor) {
  contenedor.innerHTML = `
    <div class="rf-cargando" role="status">
      <div class="spinner-border" style="color: var(--rf-accent);" aria-hidden="true"></div>
      <p class="text-rf-muted mt-2">Cargando tablero…</p>
    </div>`;

  const [datosNoticias, datosFuentes] = await Promise.all([obtenerNoticias(), obtenerFuentes()]);
  const { noticias, generadoEn, esDemostracion, avisoDemostracion, error } = datosNoticias;

  if (error) {
    contenedor.innerHTML = `
      <div class="alert rf-alert-error" role="alert">
        <i class="bi bi-wifi-off" aria-hidden="true"></i> ${error}
      </div>`;
    return;
  }

  const recientes = ordenarPorFecha(noticias).slice(0, 3);
  const destacadas = ordenarPorRelevancia(noticias).slice(0, 3);
  const pocoDifundidas = obtenerPocoDifundidas(noticias).slice(0, 3);
  const crisis = obtenerCrisis(noticias).slice(0, 3);
  const paises = resumirPorPais(noticias);
  const categorias = resumirPorCategoria(noticias);

  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-speedometer2" aria-hidden="true"></i> Dashboard</h1>
      <p class="text-rf-muted">Panorama de inteligencia financiera internacional.</p>
    </header>
    ${esDemostracion ? crearBannerDemostracion(avisoDemostracion) : ''}
    ${crearEstadisticas({
      totalNoticias: noticias.length,
      totalFuentes: datosFuentes.fuentes.length,
      totalPaises: paises.filter((p) => p.pais !== 'Global').length,
      actualizadaEn: generadoEn
    })}
    ${crearSeccion({ titulo: 'Noticias destacadas', icono: 'bi-star', noticias: destacadas })}
    ${crearSeccion({ titulo: 'Noticias poco difundidas', icono: 'bi-broadcast-pin', noticias: pocoDifundidas })}
    ${crearSeccion({ titulo: 'Crisis económicas', icono: 'bi-exclamation-triangle', noticias: crisis })}
    ${crearSeccion({ titulo: 'Noticias recientes', icono: 'bi-clock-history', noticias: recientes })}
    ${crearPanelPaises(paises)}
    ${crearPanelGrafica()}`;

  inicializarGraficaCategorias(categorias);
}
