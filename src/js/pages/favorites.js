// Página: Favoritos.
// FASE 2: noticias guardadas en IndexedDB para consulta posterior,
// disponibles sin conexión.

import { renderPlaceholder } from './placeholder.js';

export function renderFavoritos(contenedor) {
  renderPlaceholder(contenedor, {
    titulo: 'Favoritos',
    icono: 'bi-star',
    descripcion: 'Noticias guardadas para consulta posterior, disponibles sin conexión.',
    fase: 2
  });
}
