// Página: Favoritos. Funciona completamente sin conexión (IndexedDB).

import { obtenerFavoritos } from '../storage/favoritesRepository.js';
import { obtenerEstados } from '../services/offlineService.js';
import { registrarNoticias } from '../services/newsService.js';
import { crearTarjetaNoticia } from '../components/newsCard.js';
import { escapar } from '../components/utils.js';

const estado = { termino: '', orden: 'guardado-desc' };

function ordenar(lista) {
  const desc = (a, b, campo) => new Date(b[campo] ?? 0) - new Date(a[campo] ?? 0);
  switch (estado.orden) {
    case 'guardado-asc':
      return [...lista].sort((a, b) => desc(b, a, 'createdAt'));
    case 'publicada-desc':
      return [...lista].sort((a, b) => desc(a, b, 'publicadaEn'));
    case 'publicada-asc':
      return [...lista].sort((a, b) => desc(b, a, 'publicadaEn'));
    case 'relevancia-desc':
      return [...lista].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
    default:
      return [...lista].sort((a, b) => desc(a, b, 'createdAt'));
  }
}

function filtrar(lista) {
  const t = estado.termino.trim().toLowerCase();
  if (!t) {
    return lista;
  }
  return lista.filter((n) =>
    [n.titulo, n.resumen, n.fuente, n.pais, n.categoria].some((campo) =>
      (campo ?? '').toLowerCase().includes(t)
    )
  );
}

async function pintarLista() {
  const contenedor = document.querySelector('#rfListaFavoritos');
  if (!contenedor) {
    return;
  }
  const todas = await obtenerFavoritos();
  const lista = ordenar(filtrar(todas));
  registrarNoticias(lista);
  const estados = await obtenerEstados(lista.map((n) => n.id));

  const contador = document.querySelector('#rfContadorFavoritos');
  if (contador) {
    contador.textContent = `${lista.length} de ${todas.length} guardadas`;
  }

  if (!todas.length) {
    contenedor.innerHTML = `
      <div class="rf-vacio">
        <i class="bi bi-star" aria-hidden="true"></i>
        <h2 class="h5 mt-3">Aún no tienes favoritos</h2>
        <p>Marca noticias con la estrella desde el Dashboard para consultarlas aquí, incluso sin conexión.</p>
      </div>`;
    return;
  }
  if (!lista.length) {
    contenedor.innerHTML = `
      <div class="rf-vacio">
        <i class="bi bi-search" aria-hidden="true"></i>
        <p class="mt-3">Sin resultados para «${escapar(estado.termino)}».</p>
      </div>`;
    return;
  }
  contenedor.innerHTML = `
    <div class="row g-3">
      ${lista
        .map(
          (n) => `
          <div class="col-12 col-md-6 col-xl-4 rf-col-noticia">
            ${crearTarjetaNoticia(n, { ...estados.get(n.id), contexto: 'favoritos' })}
          </div>`
        )
        .join('')}
    </div>`;
}

export async function renderFavoritos(contenedor) {
  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-star" aria-hidden="true"></i> Favoritos</h1>
      <p class="text-rf-muted">Noticias marcadas para consulta posterior. Disponibles sin conexión.</p>
    </header>
    <div class="card rf-card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-12 col-md-8">
            <label class="visually-hidden" for="rfBuscarFavoritos">Buscar en favoritos</label>
            <input id="rfBuscarFavoritos" type="search" class="form-control"
                   placeholder="Buscar por título, resumen, fuente, país o categoría…"
                   value="${escapar(estado.termino)}" />
          </div>
          <div class="col-12 col-md-4">
            <label class="visually-hidden" for="rfOrdenFavoritos">Ordenar favoritos</label>
            <select id="rfOrdenFavoritos" class="form-select">
              <option value="guardado-desc">Guardadas recientes primero</option>
              <option value="guardado-asc">Guardadas antiguas primero</option>
              <option value="publicada-desc">Publicación: recientes primero</option>
              <option value="publicada-asc">Publicación: antiguas primero</option>
              <option value="relevancia-desc">Mayor relevancia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <p class="text-rf-muted rf-contador" id="rfContadorFavoritos"></p>
    <div id="rfListaFavoritos"></div>`;

  contenedor.querySelector('#rfOrdenFavoritos').value = estado.orden;
  contenedor.querySelector('#rfBuscarFavoritos').addEventListener('input', (e) => {
    estado.termino = e.target.value;
    pintarLista();
  });
  contenedor.querySelector('#rfOrdenFavoritos').addEventListener('change', (e) => {
    estado.orden = e.target.value;
    pintarLista();
  });
  await pintarLista();
}
