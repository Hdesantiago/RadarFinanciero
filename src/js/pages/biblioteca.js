// Página: Mi biblioteca. Noticias guardadas para leer posteriormente,
// disponibles sin conexión. Solo se almacenan metadatos y extractos
// permitidos por las fuentes.

import { obtenerGuardadas } from '../storage/savedNewsRepository.js';
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
  const contenedor = document.querySelector('#rfListaBiblioteca');
  if (!contenedor) {
    return;
  }
  const todas = await obtenerGuardadas();
  const lista = ordenar(filtrar(todas));
  registrarNoticias(lista);
  const estados = await obtenerEstados(lista.map((n) => n.id));

  const contador = document.querySelector('#rfContadorBiblioteca');
  if (contador) {
    contador.textContent = `${lista.length} de ${todas.length} guardadas`;
  }

  if (!todas.length) {
    contenedor.innerHTML = `
      <div class="rf-vacio">
        <i class="bi bi-collection" aria-hidden="true"></i>
        <h2 class="h5 mt-3">Tu biblioteca está vacía</h2>
        <p>Guarda noticias con el botón de marcador para leerlas después, incluso sin conexión.</p>
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
            ${crearTarjetaNoticia(n, { ...estados.get(n.id), contexto: 'biblioteca' })}
          </div>`
        )
        .join('')}
    </div>`;
}

export async function renderBiblioteca(contenedor) {
  contenedor.innerHTML = `
    <header class="rf-encabezado-pagina">
      <h1><i class="bi bi-collection" aria-hidden="true"></i> Mi biblioteca</h1>
      <p class="text-rf-muted">Noticias guardadas para leer posteriormente. Disponibles sin conexión.</p>
    </header>
    <div class="alert rf-alert-demo d-flex align-items-start gap-2" role="note">
      <i class="bi bi-shield-check" aria-hidden="true"></i>
      <div>
        Solo se almacenan metadatos y extractos permitidos por las fuentes
        (título, resumen, fuente, enlace, fecha, país y categoría). El artículo
        completo siempre se lee en la fuente original y requiere conexión.
      </div>
    </div>
    <div class="card rf-card my-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-12 col-md-8">
            <label class="visually-hidden" for="rfBuscarBiblioteca">Buscar en Mi biblioteca</label>
            <input id="rfBuscarBiblioteca" type="search" class="form-control"
                   placeholder="Buscar por título, resumen, fuente, país o categoría…"
                   value="${escapar(estado.termino)}" />
          </div>
          <div class="col-12 col-md-4">
            <label class="visually-hidden" for="rfOrdenBiblioteca">Ordenar biblioteca</label>
            <select id="rfOrdenBiblioteca" class="form-select">
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
    <p class="text-rf-muted rf-contador" id="rfContadorBiblioteca"></p>
    <div id="rfListaBiblioteca"></div>`;

  contenedor.querySelector('#rfOrdenBiblioteca').value = estado.orden;
  contenedor.querySelector('#rfBuscarBiblioteca').addEventListener('input', (e) => {
    estado.termino = e.target.value;
    pintarLista();
  });
  contenedor.querySelector('#rfOrdenBiblioteca').addEventListener('change', (e) => {
    estado.orden = e.target.value;
    pintarLista();
  });
  await pintarLista();
}
