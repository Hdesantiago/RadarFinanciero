// Acciones globales de las tarjetas de noticia mediante delegación de
// eventos: favorito, guardar en biblioteca, ver detalle y eliminar.

import { alternarFavorito, eliminarFavorito } from '../storage/favoritesRepository.js';
import {
  guardarNoticia,
  eliminarGuardada,
  estaGuardada
} from '../storage/savedNewsRepository.js';
import { obtenerNoticiaPorId } from '../services/newsService.js';
import { abrirDetalleNoticia } from './newsDetail.js';
import { confirmarEliminacion } from './confirmDialog.js';
import { mostrarToast } from './toast.js';

let inicializado = false;

export function inicializarAccionesNoticias() {
  if (inicializado) {
    return;
  }
  inicializado = true;
  document.addEventListener('click', manejarAccionNoticia);
}

function actualizarBotones(accion, id, activo) {
  document
    .querySelectorAll(`[data-accion="${accion}"][data-id="${CSS.escape(id)}"]`)
    .forEach((boton) => {
      boton.setAttribute('aria-pressed', String(activo));
      const icono = boton.querySelector('i');
      if (accion === 'favorito') {
        boton.classList.toggle('active', activo);
        if (icono) {
          icono.className = `bi ${activo ? 'bi-star-fill' : 'bi-star'}`;
        }
      }
      if (accion === 'guardar') {
        boton.classList.toggle('rf-guardada-active', activo);
        if (icono) {
          icono.className = `bi ${activo ? 'bi-bookmark-fill' : 'bi-bookmark'}`;
        }
      }
    });
}

function quitarTarjeta(boton) {
  const columna = boton.closest('.rf-col-noticia');
  const lista = columna?.parentElement;
  columna?.remove();
  // En Favoritos/Biblioteca se repinta la página para actualizar el contador
  // y mostrar el estado vacío cuando corresponda.
  if (
    lista &&
    (location.hash.startsWith('#/favoritos') || location.hash.startsWith('#/biblioteca'))
  ) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

async function manejarAccionNoticia(evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) {
    return;
  }
  const { accion, id } = boton.dataset;
  if (!accion || id == null) {
    return;
  }

  try {
    switch (accion) {
      case 'favorito': {
        const noticia = obtenerNoticiaPorId(id);
        if (!noticia) {
          return;
        }
        const activo = await alternarFavorito(noticia);
        actualizarBotones('favorito', id, activo);
        mostrarToast(
          activo ? 'Agregada a Favoritos.' : 'Eliminada de Favoritos.',
          activo ? 'exito' : 'info'
        );
        if (!activo && location.hash.startsWith('#/favoritos')) {
          quitarTarjeta(boton);
        }
        break;
      }
      case 'guardar': {
        const noticia = obtenerNoticiaPorId(id);
        if (!noticia) {
          return;
        }
        if (await estaGuardada(id)) {
          const confirmado = await confirmarEliminacion(
            '¿Quitar esta noticia de Mi biblioteca?'
          );
          if (!confirmado) {
            return;
          }
          await eliminarGuardada(id);
          actualizarBotones('guardar', id, false);
          mostrarToast('Eliminada de Mi biblioteca.', 'info');
          if (location.hash.startsWith('#/biblioteca')) {
            quitarTarjeta(boton);
          }
        } else {
          await guardarNoticia(noticia);
          actualizarBotones('guardar', id, true);
          mostrarToast('Guardada en Mi biblioteca. Disponible sin conexión.', 'exito');
        }
        break;
      }
      case 'detalle': {
        const noticia = obtenerNoticiaPorId(id);
        if (noticia) {
          await abrirDetalleNoticia(noticia);
        }
        break;
      }
      case 'eliminar-favorito': {
        const confirmado = await confirmarEliminacion(
          '¿Eliminar esta noticia de Favoritos?'
        );
        if (!confirmado) {
          return;
        }
        await eliminarFavorito(id);
        actualizarBotones('favorito', id, false);
        quitarTarjeta(boton);
        mostrarToast('Favorito eliminado.', 'info');
        break;
      }
      case 'eliminar-guardada': {
        const confirmado = await confirmarEliminacion(
          '¿Eliminar esta noticia de Mi biblioteca?'
        );
        if (!confirmado) {
          return;
        }
        await eliminarGuardada(id);
        actualizarBotones('guardar', id, false);
        quitarTarjeta(boton);
        mostrarToast('Noticia eliminada de Mi biblioteca.', 'info');
        break;
      }
    }
  } catch (error) {
    console.error('[newsActions]', error);
    mostrarToast('No se pudo completar la acción.', 'error');
  }
}
