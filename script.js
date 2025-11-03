/* eslint-env browser */
'use strict';

/* ------------------ Estado global ------------------ */
let imagenes = [];
let indiceActual = 0;
let filas = 3;
let columnas = 3;

let canvas, ctx;
let piezas = [];                    // piezas con {sx,sy,sw,sh, x,y, ox,oy}
let piezaVacia = { x: null, y: null };
let imgActual = new Image();

/* ------------------ Utilidades ------------------ */
const $ = (sel) => document.querySelector(sel);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function ajustarCanvas() {
  // Ajusta el canvas a un cuadrado en función de la ventana
  const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9);
  canvas.width = size;
  canvas.height = size;
}

function fadeIn(audio, target = 0.5, step = 0.04, intervalMs = 120) {
  target = clamp(target, 0, 1);
  const iv = setInterval(() => {
    audio.volume = Math.min(audio.volume + step, target);
    if (audio.volume >= target) clearInterval(iv);
  }, intervalMs);
}

/* ------------------ Carga inicial ------------------ */
document.addEventListener('DOMContentLoaded', async () => {
  canvas = $('#puzzleCanvas');
  ctx = canvas.getContext('2d', { alpha: true });

  bindUI();
  await cargarCatalogoImagenes();
  crearCollage(); // decorativo

  // Activar música en el MENÚ tras la primera interacción (PC/móvil)
  const audio = $('#musica');
  const tryStartMusicOnce = async () => {
    if (!audio || !audio.paused) return;
    try {
      audio.volume = 0;
      audio.currentTime = 0;
      await audio.play();
      fadeIn(audio, 0.5);
      window.removeEventListener('pointerdown', tryStartMusicOnce);
      window.removeEventListener('keydown', tryStartMusicOnce);
    } catch (e) {
      // Si no se puede, se intentará de nuevo en la siguiente interacción
    }
  };
  window.addEventListener('pointerdown', tryStartMusicOnce, { once: false });
  window.addEventListener('keydown', tryStartMusicOnce, { once: false });
});

/* ------------------ UI & eventos ------------------ */
function bindUI() {
  $('#btnComenzar').addEventListener('click', () => iniciarJuego());
  $('#btnMezclar').addEventListener('click', () => mezclarPiezas());
  $('#btnSiguiente').addEventListener('click', () => siguienteImagen());

  // Interacción unificada: Pointer Events (evita doble disparo click + touch)
  canvas.addEventListener('pointerup', manejarPointerUp, { passive: true });

  // Redibuja al redimensionar
  window.addEventListener('resize', () => {
    if (!$('#juego').hasAttribute('hidden')) {
      ajustarCanvas();
      dibujarPiezas(true);
    }
  });
}

/* ------------------ Carga del catálogo ------------------ */
async function cargarCatalogoImagenes() {
  try {
    const res = await fetch('images.json', { cache: 'no-store' });
    imagenes = await res.json();
  } catch (err) {
    console.error('No se pudo cargar images.json. Verifica que exista en la raíz del repo.', err);
    imagenes = []; // fallback
  }
}

/* ------------------ Collage decorativo ------------------ */
function crearCollage() {
  const collageDiv = $('#collage');
  if (!collageDiv) return;
  collageDiv.innerHTML = '';

  if (!Array.isArray(imagenes) || imagenes.length === 0) return;

  const seleccionadas = [];
  while (seleccionadas.length < Math.min(25, imagenes.length)) {
    const rand = imagenes[Math.floor(Math.random() * imagenes.length)];
    if (!seleccionadas.includes(rand)) seleccionadas.push(rand);
  }
  for (const src of seleccionadas) {
    const img = document.createElement('img');
    img.decoding = 'async';
    img.loading = 'lazy';
    img.src = `images/${src}`;
    collageDiv.appendChild(img);
  }
}

/* ------------------ Flujo de juego ------------------ */
function iniciarJuego() {
  // Leer dificultad
  const val = parseInt($('#dificultad').value, 10);
  filas = columnas = isNaN(val) ? 3 : clamp(val, 3, 10);

  // Mostrar/ocultar pantallas
  $('#menu').setAttribute('hidden', '');
  $('#juego').removeAttribute('hidden');

  // Si por alguna razón la música no arrancó aún, inténtalo ahora
  const audio = $('#musica');
  if (audio && audio.paused) {
    audio.volume = 0;
    audio.currentTime = 0;
    audio.play().then(() => fadeIn(audio, 0.5)).catch(() => {});
  }

  // Preparar canvas y mostrar una imagen completa (sin hueco)
  ajustarCanvas();
  mostrarImagen();
}

function mostrarImagen(indice = null) {
  if (!Array.isArray(imagenes) || imagenes.length === 0) {
    // No hay catálogo; limpia y avisa
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('#mensaje').textContent = 'No se encontraron imágenes (verifica images.json y la carpeta /images).';
    return;
  }

  if (indice === null) indice = Math.floor(Math.random() * imagenes.length);
  indiceActual = indice;

  // Cargar imagen
  imgActual = new Image();
  imgActual.decoding = 'async';
  imgActual.onload = () => {
    // Crear piezas ordenadas (estado resuelto)
    piezas = [];
    piezaVacia.x = columnas - 1;
    piezaVacia.y = filas - 1;

    const sw = imgActual.width / columnas;
    const sh = imgActual.height / filas;

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        piezas.push({
          // Región de origen en la imagen
          sx: j * sw,
          sy: i * sh,
          sw, sh,
          // Posición actual en la grilla (empieza resuelto)
          x: j,
          y: i,
          // Posición objetivo (para verificación)
          ox: j,
          oy: i
        });
      }
    }

    // Dibuja imagen completa (sin hueco) para “previsualizar”
    dibujarPiezas(false);
    // Limpia mensaje
    $('#mensaje').textContent = '';
  };
  imgActual.src = `images/${imagenes[indice]}`;
}

function dibujarPiezas(mostrarVacio = true) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ancho = canvas.width / columnas;
  const alto  = canvas.height / filas;

  for (const p of piezas) {
    // Si esta celda coincide con el hueco y queremos mostrarlo, pinta el hueco
    if (mostrarVacio && p.x === piezaVacia.x && p.y === piezaVacia.y) {
      ctx.fillStyle = '#000';
      ctx.fillRect(p.x * ancho, p.y * alto, ancho, alto);
      continue;
    }

    // Dibuja el fragmento de imagen correspondiente
    ctx.drawImage(
      imgActual,
      p.sx, p.sy, p.sw, p.sh,
      p.x * ancho, p.y * alto, ancho, alto
    );
  }
}

/* Mezcla mediante 1000 movimientos válidos del hueco (siempre alcanzable) */
function mezclarPiezas() {
  if (!piezas.length) return;

  for (let i = 0; i < 1000; i++) {
    const adyacentes = piezas.filter((p) => esAdyacenteVacia(p));
    const mover = adyacentes[Math.floor(Math.random() * adyacentes.length)];
    moverPieza(mover, false);
  }
  dibujarPiezas(true);
  $('#mensaje').textContent = '';
}

/* Determina si la pieza es adyacente al hueco */
function esAdyacenteVacia(p) {
  const dx = Math.abs(p.x - piezaVacia.x);
  const dy = Math.abs(p.y - piezaVacia.y);
  return (dx + dy) === 1;
}

/* Intercambia la pieza con el hueco */
function moverPieza(pieza, redraw = true) {
  if (!pieza) return;
  if (esAdyacenteVacia(pieza)) {
    const tx = pieza.x, ty = pieza.y;
    pieza.x = piezaVacia.x;
    pieza.y = piezaVacia.y;
    piezaVacia.x = tx;
    piezaVacia.y = ty;
    if (redraw) dibujarPiezas(true);
  }
}

/* Pointer handler (click/touch unificados) */
function manejarPointerUp(e) {
  const rect = canvas.getBoundingClientRect();
  const xClick = e.clientX - rect.left;
  const yClick = e.clientY - rect.top;

  const ancho = canvas.width / columnas;
  const alto  = canvas.height / filas;

  const xPieza = Math.floor(xClick / ancho);
  const yPieza = Math.floor(yClick / alto);

  const pieza = piezas.find((p) => p.x === xPieza && p.y === yPieza);
  // No intentes mover “el hueco”
  if (pieza && !(pieza.x === piezaVacia.x && pieza.y === piezaVacia.y)) {
    moverPieza(pieza);
    verificarPuzzleCompleto();
  }
}

/* Verifica si todas las piezas (excepto el hueco) están en su lugar objetivo */
function verificarPuzzleCompleto() {
  const completo = piezas.every((p) => p.x === p.ox && p.y === p.oy) &&
                   piezaVacia.x === (columnas - 1) && piezaVacia.y === (filas - 1);

  if (completo) {
    $('#mensaje').textContent = '¡Felicidades! 💖 Puzzle completado';
  }
}

/* Cambia a otra imagen y reinicia estado */
function siguienteImagen() {
  mostrarImagen();
}
