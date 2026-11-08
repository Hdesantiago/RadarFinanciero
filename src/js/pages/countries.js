// Página: Expediente por país.
// FASE 4/5: ficha por país con deuda pública, déficit fiscal, inflación,
// bonos, política monetaria, calificación crediticia, riesgos financieros
// y cronología.

import { renderPlaceholder } from './placeholder.js';

export function renderPaises(contenedor) {
  renderPlaceholder(contenedor, {
    titulo: 'Países',
    icono: 'bi-flag',
    descripcion: 'Expedientes por país con cronología e indicadores disponibles.',
    fase: 4
  });
}
