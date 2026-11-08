// Página: Noticias mundiales (Radar de noticias).
// FASE 4: búsqueda por título y palabras clave, filtros por país,
// categoría y fecha, y ordenamiento por relevancia o fecha.

import { renderPlaceholder } from './placeholder.js';

export function renderNoticias(contenedor) {
  renderPlaceholder(contenedor, {
    titulo: 'Noticias mundiales',
    icono: 'bi-globe-americas',
    descripcion: 'Búsqueda y filtrado de noticias financieras internacionales.',
    fase: 4
  });
}
