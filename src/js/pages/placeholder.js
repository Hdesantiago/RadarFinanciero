// Vista provisional para módulos planificados en fases posteriores.

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

export function renderPlaceholder(contenedor, { titulo, icono, descripcion, fase }) {
  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi ${icono}" aria-hidden="true"></i> ${escapar(titulo)}</h1>
      <p class="text-rf-muted">${escapar(descripcion)}</p>
    </header>
    <div class="card rf-card rf-placeholder">
      <div class="card-body text-center py-5">
        <i class="bi ${icono} rf-placeholder-icono" aria-hidden="true"></i>
        <h2 class="h5 mt-3">Módulo en construcción</h2>
        <p class="text-rf-muted mb-0">
          Este módulo se implementará en la <strong>FASE ${fase}</strong> del plan de desarrollo.
        </p>
      </div>
    </div>`;
}
