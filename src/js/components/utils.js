// Utilidades compartidas de presentación.

export function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

export function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function claseRelevancia(valor) {
  if (valor >= 80) return 'rf-relevancia-alta';
  if (valor >= 60) return 'rf-relevancia-media';
  return 'rf-relevancia-baja';
}
