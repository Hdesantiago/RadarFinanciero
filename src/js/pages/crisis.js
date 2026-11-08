// Página: Crisis financieras.
// FASE 4/5: seguimiento de crisis de deuda soberana, bancarias e
// inmobiliarias con agrupación de acontecimientos relacionados.

import { renderPlaceholder } from './placeholder.js';

export function renderCrisis(contenedor) {
  renderPlaceholder(contenedor, {
    titulo: 'Crisis financieras',
    icono: 'bi-exclamation-triangle',
    descripcion: 'Seguimiento de crisis económicas y financieras activas.',
    fase: 4
  });
}
