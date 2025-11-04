// ==== VARIABLES (MISMAS) ====
let canvas = document.getElementById("puzzle");
let ctx = canvas.getContext("2d");
let imagenes = [];
let imagenActual = null;
let nivel = 4; // 4x4 por defecto
let piezas = [];
let vacia = null;
let onResizeBound = false;
let resizeTimer;
let puzzleBloqueado = true;

// Mejora: estado adicional para mezcla/estadísticas
let ultimaPiezaMovida = null;
let movimientosHechos = 0;

// Ajusta el canvas a la relación de aspecto de la imagen y al espacio disponible
function configurarCanvasSegunImagen(img) {
  const maxAncho = Math.floor(window.innerWidth * 0.9);
  const maxAlto  = Math.floor(window.innerHeight * 0.7);
  const ratioImg = img.width / img.height;

  let anchoCanvas = maxAncho;
  let altoCanvas  = Math.round(maxAncho / ratioImg);

  if (altoCanvas > maxAlto) {
    altoCanvas  = maxAlto;
    anchoCanvas = Math.round(maxAlto * ratioImg);
  }
  
  // Versión simple (sin DPR): canvas real = canvas visible
  canvas.width  = anchoCanvas;
  canvas.height = altoCanvas;
}

// Callback al ganar (puedes personalizar)
function onWin() {
    const premios = [
  { texto: "Un abrazo largo hasta que tu corazón se calme 🤗💗", nivel: "Fácil" },
  { texto: "Un beso donde tú quieras 💋👩‍❤️‍💋‍👨", nivel: "Fácil" },
  { texto: "Un chocolate 🍫 para ese gran corazón 💘", nivel: "Fácil" },
  { texto: "Un pancito hecho por mí 🍞☕💞", nivel: "Fácil" },
  { texto: "Un masajito para tus manos o espalda 💆‍♀️✨", nivel: "Fácil" },
  { texto: "Una canción dedicada solo para ti 🎧💌", nivel: "Fácil" },
  { texto: "Una foto juntitos para guardar el momento 📸💕", nivel: "Fácil" },
  { texto: "Un meme romántico hecho para ti 😘🤣", nivel: "Fácil" },
  { texto: "Un mensaje largo diciéndote por qué te amo 💬❤️", nivel: "Fácil" },
  { texto: "Un post-it escondido con algo bonito escrito ✍️💖", nivel: "Fácil" },
  { texto: "Agua heladita servida por mí 🥤❄️", nivel: "Fácil" },
  { texto: "Una “palmadita” en la frente con amor 🥺👉👈", nivel: "Fácil" },
  { texto: "Una caricia en tu pelo, suavecito 😌💗", nivel: "Fácil" },
  { texto: "Un apapacho de mí para ti 🤗💕", nivel: "Fácil" },
  { texto: "Un tecito preparado para ti ☕🌸", nivel: "Fácil" },
  { texto: "Mi polerón para que no tengas frío 🧥💞", nivel: "Fácil" },
  { texto: "Hacerte reír aunque tengas el día malo 😂💗", nivel: "Fácil" },
  { texto: "Decirte 5 cosas hermosas sobre ti 🌟💗", nivel: "Fácil" },
  { texto: "Una mini playlist con canciones para ti 🎶❤️", nivel: "Fácil" },
  { texto: "Una foto divertida juntos 📸🤣", nivel: "Fácil" },
  { texto: "Un baile ridículo para sacarte risas 💃🤣", nivel: "Fácil" },
  { texto: "Un dibujito hecho por mí, feo pero con amor 🎨💘", nivel: "Fácil" },
  { texto: "Tu comida favorita preparada por mí 🍲💓", nivel: "Fácil" },
  { texto: "Acepto perder una apuesta sin alegar 🙋‍♂️😅", nivel: "Fácil" },
  { texto: "Un masaje en esos hombros ricos 💆‍♀️💖", nivel: "Fácil" },
  { texto: "Un “vale por robarte mi polerón” 🧥💗", nivel: "Fácil" },
  { texto: "Una nota escondida en tu cartera ✉️🌷", nivel: "Fácil" },
  { texto: "La cama lista para que tú solo llegues a acostarte 🛏️✨", nivel: "Fácil" },
  { texto: "Guardarte un postre para después 🍫🫶", nivel: "Fácil" },
  { texto: "Leer juntitos algo corto 📖💞", nivel: "Fácil" },
  { texto: "Una siesta abrazados 😴💗", nivel: "Fácil" },
  { texto: "Ver tu reel o TikTok sin reclamar 📱😂💗", nivel: "Fácil" },
  { texto: "10 minutos sin celular solo mirándote a ti 🌸💗", nivel: "Fácil" },
  { texto: "Subir una historia juntos 📱💑", nivel: "Fácil" },
  { texto: "Piojitos suaves en tu cabeza 😌💤", nivel: "Fácil" },
  { texto: "Un “vale por 1 favorcito” tú eliges 🎟️💗", nivel: "Fácil" },
  { texto: "Un “te amo” susurrado en tu oído 💘👂", nivel: "Fácil" },
  { texto: "Un dulcecito pa’ endulzar tu día 🍬💞", nivel: "Fácil" },
  { texto: "Hacerte reír imitando algo tuyo 😂💗", nivel: "Fácil" },
  { texto: "Un piquito sorpresa 😘💋", nivel: "Fácil" },
  { texto: "Cocinarte algo rico (panqueques, completos, etc.) 🍽️💗", nivel: "Medio" },
  { texto: "Noche de películas y tú eliges 🎬🍿💕", nivel: "Medio" },
  { texto: "Salida a caminar o al parque tomados de la mano 🌳💞", nivel: "Medio" },
  { texto: "Una flor para tu día 🌹💗", nivel: "Medio" },
  { texto: "Una carta escrita a mano ✍️💖", nivel: "Medio" },
  { texto: "Masajito hasta que estés a gusto 💆‍♀️✨💗", nivel: "Medio" },
  { texto: "Un helado juntos 🍦🫶", nivel: "Medio" },
  { texto: "Un desayuno preparado por mí 🥐☕💗", nivel: "Medio" },
  { texto: "Una playlist hecha solo para ti 🎶💘", nivel: "Medio" },
  { texto: "Un día sin enojarse, pase lo que pase 😇💕", nivel: "Medio" },
  { texto: "Un collage de fotos juntos 📸💝", nivel: "Medio" },
  { texto: "Mini sesión de fotos bonita 📷🌸", nivel: "Medio" },
  { texto: "Tu snack favorito comprado por mí 🍪💗", nivel: "Medio" },
  { texto: "Una noche de película, con cabritas y abrazos hasta que te quedes dormida 🎬🍿🧸", nivel: "Medio" },
  { texto: "Acompañarte a algo que te da lata ir sola 🚶‍♀️🫶", nivel: "Medio" },
  { texto: "Ver una serie que a ti te guste 📺❤️", nivel: "Medio" },
  { texto: "Un llaverito para ti 🔑💗", nivel: "Medio" },
  { texto: "Decorar tu pieza con post-its románticos 💌🩷", nivel: "Medio" },
  { texto: "Jugar algo juntos 🎮💞", nivel: "Medio" },
  { texto: "TikTok juntos (aunque me dé vergüenza) 🎥😂💗", nivel: "Medio" },
  { texto: "Picnic pequeño pero con amor 🧺🌤️💗", nivel: "Medio" },
  { texto: "Una tarde de videojuegos tú vs yo 🎮❤️", nivel: "Medio" },
  { texto: "Regaloneo y siesta juntos 😴💗", nivel: "Medio" },
  { texto: "Un dibujo bonito de nosotros dos 🎨💏", nivel: "Medio" },
  { texto: "Una sorpresa escondida para que la encuentres 💝🔍", nivel: "Medio" },
  { texto: "Una playlist solo con canciones que digan Khaterine 🎶💕", nivel: "Medio" },
  { texto: "Un regalo hecho a mano 🧶💗", nivel: "Medio" },
  { texto: "Ir a ver las estrellas 🌌💞", nivel: "Medio" },
  { texto: "Llevarte a tu lugar favorito 🌆💗", nivel: "Medio" },
  { texto: "Prepararte algo dulce casero 🍩💗", nivel: "Medio" },
  { texto: "Una cena preparada por mí, bonita y romántica 🍽️🕯️💗", nivel: "Difícil" },
  { texto: "Un álbum de nuestros mejores momentos 📚💘", nivel: "Difícil" },
  { texto: "Un paseo sorpresa 🚗💞", nivel: "Difícil" },
  { texto: "Una tarde completa sin celular, solo tú y yo 💗📵", nivel: "Difícil" },
  { texto: "Un día entero dedicado solo a ti 🌸❤️", nivel: "Difícil" },
  { texto: "Una escapada romántica a la playa o al campo 🌅❤️", nivel: "Difícil" },
  { texto: "Un regalo que hayas insinuado sin que lo pidas 🎁🫶", nivel: "Difícil" },
  { texto: "Una caja de razones por las que te amo 🎁💌", nivel: "Difícil" },
  { texto: "Un video con fotos y música nuestra 🎥💞", nivel: "Difícil" },
  { texto: "Escribir 20 cosas hermosas sobre ti ✍️💗", nivel: "Difícil" },
  { texto: "Un cambio de look hecho por ti en mi pelo 💇‍♂️🤣💗", nivel: "Difícil" },
  { texto: "Prepararte una sorpresa en la mañana 🌅💝", nivel: "Difícil" },
  { texto: "Una tarde de spa en casa 💆‍♀️🧖‍♂️💗", nivel: "Difícil" },
  { texto: "Un peluche elegido por ti 🧸💝", nivel: "Difícil" },
  { texto: "Una salida al cine, tú eliges la película 🎬❤️", nivel: "Difícil" },
  { texto: "Una escapadita a donde tú quieras (cerca) 🚗🌄💗", nivel: "Difícil" },
  { texto: "Una playlist con 50 canciones que me recuerdan a ti 🎶💗", nivel: "Difícil" },
  { texto: "Un poema escrito desde cero solo para ti ✍️🌹", nivel: "Difícil" },
  { texto: "Una tarde haciendo algo que a ti te ENCANTA 🧁🎨🎮💗", nivel: "Difícil" },
  { texto: "Un día completo sin discutir ni molestar 😇💗", nivel: "Difícil" },
  { texto: "Un regalo sorpresa que no veas venir 🎁👀💗", nivel: "Difícil" },
  { texto: "Grabarte un video diciendo cuánto te amo 🎥❤️", nivel: "Difícil" },
  { texto: "Comprar algo chiquitito pero significativo 🎁💘", nivel: "Difícil" },
  { texto: "Llevarte a ver el atardecer 🌅💞", nivel: "Difícil" },
  { texto: "Regalarte tu torta favorita de piña 🍍🎂💗 en modo sorpresa", nivel: "Difícil" },
  { texto: "Una caja con dulces, fotos y notitas 🍬💌", nivel: "Difícil" },
  { texto: "Una tarde entera mimándote 💆‍♀️💞", nivel: "Difícil" },
  { texto: "Una actividad sorpresa hecha por mí 🎉💗", nivel: "Difícil" },
  { texto: "Cumplir un deseo que tú pidas (con límites sanos) 💝", nivel: "Difícil" },
  { texto: "Un “cupón” por un día donde tú mandas 🫡💗", nivel: "Difícil" }
];
    
  // Filtra premios según el nivel actual
  let nivelTexto = nivel === 3 ? "Fácil" : nivel === 4 ? "Medio" : "Difícil";
  const premiosFiltrados = premios.filter(p => p.nivel === nivelTexto);

  // Elige uno al azar
  const premio = premiosFiltrados[Math.floor(Math.random() * premiosFiltrados.length)];

  // Muestra mensaje
  setTimeout(() => {
    alert(`¡Resuelto en ${movimientosHechos} movimientos!\n\n🎁 Premio ganado: ${premio.texto}`);
  }, 10);
}

// ==== UTILIDADES CANVAS/DPR (NUEVAS) ====
// Configura el canvas cuadrado, con nitidez (devicePixelRatio)
function configurarCanvasCuadrado() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const ladoCss = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7);

  // Tamaño visual (CSS)
  canvas.style.width = `${ladoCss}px`;
  canvas.style.height = `${ladoCss}px`;

  // Tamaño real (px de dibujo)
  canvas.width = Math.round(ladoCss * dpr);
  canvas.height = Math.round(ladoCss * dpr);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  return { dpr, ladoCss, ladoPx: canvas.width }; // cuadrado
}

// Rect destino para dibujar img sin deformación (letterbox centrado)
function getDestRectForImage(img, ladoPx) {
  const rImg = img.width / img.height;
  let dw, dh, dx, dy;
  if (rImg > 1) {
    // imagen más ancha
    dw = ladoPx;
    dh = Math.round(ladoPx / rImg);
    dx = 0;
    dy = Math.round((ladoPx - dh) / 2);
  } else {
    // imagen más alta o cuadrada
    dh = ladoPx;
    dw = Math.round(ladoPx * rImg);
    dy = 0;
    dx = Math.round((ladoPx - dw) / 2);
  }
  return { dx, dy, dw, dh };
}

// ==== CARGAR IMÁGENES (MISMO NOMBRE) ====
fetch("images.json")
  .then(r => r.json())
  .then(data => { imagenes = data; })
  .catch(err => {
    console.error("No se pudo cargar images.json. Revisa la ruta en GitHub Pages.", err);
    imagenes = [];
  });

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (imagenActual) {
      // Mejora: redimensionar sin reiniciar el estado del puzzle
      configurarCanvasCuadrado();
      dibujarPuzzle(imagenActual);
    }
  }, 100);
}

function empezarJuego() {
  // 1) Alternar pantallas
  document.getElementById("pantalla-inicio").classList.add("oculto");
  document.getElementById("pantalla-juego").classList.remove("oculto");

  // 2) Pausar video portada si procede
  const video = document.getElementById("video-portada");
  if (video && !video.paused) {
    try { video.pause(); } catch (e) {}
  }

  // 3) Leer dificultad
  const sel = document.getElementById("dificultad");
  if (sel) {
    const val = parseInt(sel.value, 10);
    if (!Number.isNaN(val) && val >= 3 && val <= 8) {
      nivel = val;
    }
  }

  // 4) Música tras gesto del usuario
  try { reproducirMusica?.(); } catch {}

  // 5) Iniciar puzzle (elige imagen y prepara)
  try {
    nuevaImagen(); // maneja el caso sin imágenes
  } catch (e) {
    console.error("Error iniciando puzzle:", e);
  }

  // 6) Redimensionado con protección para no duplicar
  if (!onResizeBound) {
    window.addEventListener("resize", onResize, { passive: true });
    onResizeBound = true;
  }

  // Mejora: evita gestos de scroll/zoom dentro del canvas en touch
  canvas.style.touchAction = 'none';
}

// ==== AUDIO (MISMO NOMBRE) ====
function reproducirMusica({ volumenObjetivo = 0.6, fadeMs = 120, paso = 0.05, margenFinal = 1 } = {})
{
  const audio = document.getElementById("musica");
  if (!audio) return;

  // volumen objetivo; inicia en 0 para evitar bloqueos
  audio.volume = 0;

  // Función que fija un punto inicial aleatorio seguro y reproduce
  const startAndPlay = () => {
    const dur = audio.duration;

    // Si aún no hay duración, no podemos calcular; salir
    if (!Number.isFinite(dur) || dur <= 0) return;

    // Para evitar cortar justo al final, restamos un pequeño margen (1s por defecto)
    const maxInicio = Math.max(0, dur - margenFinal);
    const inicioAleatorio = Math.random() * maxInicio;

    try { audio.currentTime = inicioAleatorio; } catch (_) { /* algunos navegadores limitan esto */ }

    audio.play()
      .then(() => {
        // fade-in suave
        const iv = setInterval(() => {
          audio.volume = Math.min(audio.volume + paso, volumenObjetivo);
          if (audio.volume >= volumenObjetivo) clearInterval(iv);
        }, fadeMs);
      })
      .catch(() => {
        // Si aún falla, se podrá iniciar manualmente (ya hubo interacción)
      });
  };

  // Si ya conocemos la duración, arrancamos ya; si no, esperamos metadatos
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    startAndPlay();
  } else {
    // Solo una vez
    const onMeta = () => {
      audio.removeEventListener('loadedmetadata', onMeta);
      startAndPlay();
    };
    audio.addEventListener('loadedmetadata', onMeta, { once: true });

    // Cargar metadatos si no están listos
    try { audio.load?.(); } catch (_) {}
  }
}

// ==== ELEGIR OTRA IMAGEN (MISMO NOMBRE) ====
function nuevaImagen() {
  if (!imagenes || imagenes.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#900";
    ctx.font = "16px sans-serif";
    ctx.fillText("No hay imágenes. Verifica images.json y carpeta /images.", 16, 28);
    return;
  }

  const random = Math.floor(Math.random() * imagenes.length);
  const img = new Image();

  // Importante en GitHub Pages: si images.json lista "foto.jpg",
  // coloca realmente las imágenes en /images/foto.jpg y referencia así:
  img.src = (imagenes[random].startsWith("images/")) ? imagenes[random] : `images/${imagenes[random]}`;

  img.onload = () => {
    imagenActual = img;

    // ✅ Ajusta el canvas a la relación de aspecto de la imagen antes de preparar
    configurarCanvasSegunImagen(img);
    prepararPuzzle(img);
  };

  img.onerror = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#900";
    ctx.font = "16px sans-serif";
    ctx.fillText(`No se pudo cargar: ${img.src}`, 16, 28);
  };
  puzzleBloqueado = true;
}

// ==== PREPARAR PUZZLE (MISMO NOMBRE, MEJORADO) ====
function prepararPuzzle(img) {
  // ajustar canvas con DPR (sin deformar) y limpiar
  const { ladoPx } = configurarCanvasCuadrado();

  piezas = [];
  const anchoP = ladoPx / nivel;
  const altoP = ladoPx / nivel;

  for (let f = 0; f < nivel; f++) {
    for (let c = 0; c < nivel; c++) {
      let esUltima = (f === nivel - 1 && c === nivel - 1);
      piezas.push({
        // posición lógica actual
        fila: f,
        col:  c,
        // posición px (no usada para dibujar letterbox, pero mantenida por compatibilidad)
        x: Math.round(c * anchoP),
        y: Math.round(f * altoP),
        // objetivo para detección de victoria
        fila0: f,
        col0:  c,
        // estado
        vacia: esUltima
      });
    }
  }

  vacia = piezas[piezas.length - 1]; // único hueco
  movimientosHechos = 0;
  ultimaPiezaMovida = null;

  dibujarPuzzle2(img);
}

// ==== DIBUJAR (MISMO NOMBRE, MEJORADO SIN DEFORMAR) ====
function dibujarPuzzle2(img) {

  // fondo existente
  ctx.fillStyle = "#000000ff"; // fondo rosa suave donde no hay imagen
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ladoPx = canvas.width; // cuadrado
  const { dx: destX, dy: destY, dw: destW, dh: destH } = getDestRectForImage(img, ladoPx);
  const dw = destW / nivel;
  const dh = destH / nivel;

  ctx.lineWidth = Math.max(1, Math.floor(ladoPx / 400));
  ctx.strokeStyle = "#b47891ff";

  piezas.forEach(p => {
    const dx = Math.round(destX + p.col * dw);
    const dy = Math.round(destY + p.fila * dh);
    const dW = Math.ceil(dw);
    const dH = Math.ceil(dh);

    if (!p.vacia) {
        const sx = Math.round(p.col0 * (img.width  / nivel));
        const sy = Math.round(p.fila0 * (img.height / nivel));
        const sW = Math.round(img.width  / nivel);
        const sH = Math.round(img.height / nivel);
        ctx.drawImage(img, sx, sy, sW, sH, dx, dy, dW, dH);
    } else {
        const sx = Math.round(p.col0 * (img.width  / nivel));
        const sy = Math.round(p.fila0 * (img.height / nivel));
        const sW = Math.round(img.width  / nivel);
        const sH = Math.round(img.height / nivel);
        ctx.drawImage(img, sx, sy, sW, sH, dx, dy, dW, dH);
    } 

    // guía opcional
    ctx.strokeRect(dx + 0.5, dy + 0.5, dW - 1, dH - 1);
  });
}

function dibujarPuzzle(img) {

  // fondo existente
  ctx.fillStyle = "#000000ff"; // fondo rosa suave donde no hay imagen
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const ladoPx = canvas.width; // cuadrado
  const { dx: destX, dy: destY, dw: destW, dh: destH } = getDestRectForImage(img, ladoPx);
  const dw = destW / nivel;
  const dh = destH / nivel;

  ctx.lineWidth = Math.max(1, Math.floor(ladoPx / 400));
  ctx.strokeStyle = "#b47891ff";

  piezas.forEach(p => {
    const dx = Math.round(destX + p.col * dw);
    const dy = Math.round(destY + p.fila * dh);
    const dW = Math.ceil(dw);
    const dH = Math.ceil(dh);

    if (!p.vacia) {
        const sx = Math.round(p.col0 * (img.width  / nivel));
        const sy = Math.round(p.fila0 * (img.height / nivel));
        const sW = Math.round(img.width  / nivel);
        const sH = Math.round(img.height / nivel);
        ctx.drawImage(img, sx, sy, sW, sH, dx, dy, dW, dH);
    } else {
      // pieza vacía = negro
      ctx.fillStyle = "#ffb7d5";
      ctx.fillRect(dx, dy, dW, dH);
    }

    // guía opcional
    ctx.strokeRect(dx + 0.5, dy + 0.5, dW - 1, dH - 1);
  });
}

// ==== MEZCLAR (MISMO NOMBRE, MEJORADO) ====
function mezclarPiezas() {
  // Mezcla por movimientos válidos del hueco => siempre resoluble
  const movimientos = 2; // proporcional al tamaño
  ultimaPiezaMovida = null;
  puzzleBloqueado = false;

  for (let i = 0; i < movimientos; i++) moverAleatorio(true);

  // Evitar que quede resuelto por azar
  if (estaResuelto()) moverAleatorio(true);

  dibujarPuzzle(imagenActual);
}

function moverAleatorio(esMezcla = false) {
  const ady = piezas.filter(p =>
    !p.vacia &&
    (
      (Math.abs(p.fila - vacia.fila) === 1 && p.col === vacia.col) ||
      (Math.abs(p.col - vacia.col) === 1 && p.fila === vacia.fila)
    )
  );

  if (ady.length === 0) return false;

  // Evitar deshacer el último movimiento si hay alternativas
  const opciones = (ultimaPiezaMovida && ady.length > 1)
    ? ady.filter(p => p !== ultimaPiezaMovida)
    : ady;

  const pieza = opciones[Math.floor(Math.random() * opciones.length)];
  return intercambiar(pieza, { esMezcla });
}

// ==== INTERCAMBIO (MISMO NOMBRE, MEJORADO) ====
function intercambiar(p, { esMezcla = false } = {}) {
  if (!p || p.vacia) return false;

  const tmpX = p.x, tmpY = p.y, tmpF = p.fila, tmpC = p.col;

  p.x = vacia.x; p.y = vacia.y;
  p.fila = vacia.fila; p.col = vacia.col;

  vacia.x = tmpX; vacia.y = tmpY;
  vacia.fila = tmpF; vacia.col = tmpC;

  ultimaPiezaMovida = p;

  if (!esMezcla) {
    movimientosHechos++;
    if (estaResuelto()) onWin();
  }

  return true;
}

// ==== ESTADO: ¿RESUELTO? (NUEVO) ====
function estaResuelto() {
  return piezas.every(p => p.vacia || (p.fila === p.fila0 && p.col === p.col0));
}

// ==== INTERACCIÓN (MISMOS HANDLERS DE NOMBRE, mejorados) ====
// Click en PC
canvas.addEventListener("click", moverSiPosible);

// Reemplaza tus listeners de click/touch por este único:
canvas.style.touchAction = 'none'; // evita scroll/zoom en touch sobre el canvas
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault(); // importante para que no haya gestos por defecto
  moverSiPosible(e);
}, { passive: false });

// Mejora: cálculo robusto de celda usando clientX/clientY y rect del canvas
function moverSiPosible(e) {
  if (puzzleBloqueado) return false;

  // Obtener clientX/clientY desde mouse o touch
  let clientX, clientY;
  if (e && e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if (e && typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
    // Fallback menos robusto (evitar si puedes)
    const dw = canvas.width / nivel;
    const dh = canvas.height / nivel;
    const colAlt = Math.floor(e.offsetX / dw);
    const filaAlt = Math.floor(e.offsetY / dh);
    if (colAlt < 0 || colAlt >= nivel || filaAlt < 0 || filaAlt >= nivel) return false;

    const piezaAlt = piezas.find(p => p.fila === filaAlt && p.col === colAlt);
    if (!piezaAlt || piezaAlt.vacia) return false;

    const cercaAlt =
      (piezaAlt.fila === vacia.fila && Math.abs(piezaAlt.col - vacia.col) === 1) ||
      (piezaAlt.col === vacia.col && Math.abs(piezaAlt.fila - vacia.fila) === 1);

    if (!cercaAlt) return false;

    const okAlt = intercambiar(piezaAlt, { esMezcla: false });
    if (okAlt) dibujarPuzzle(imagenActual);
    return okAlt;
  } else {
    return false;
  }

  // Cálculo robusto de celda con rect (independiente de DPR/CSS)
  const rect = canvas.getBoundingClientRect();
  const rx = (clientX - rect.left) / rect.width;   // 0..1
  const ry = (clientY - rect.top)  / rect.height;  // 0..1

  // Si el puntero cae fuera del rect del canvas, abortar
  if (rx < 0 || rx > 1 || ry < 0 || ry > 1) return false;

  const col = Math.min(nivel - 1, Math.max(0, Math.floor(rx * nivel)));
  const fila = Math.min(nivel - 1, Math.max(0, Math.floor(ry * nivel)));

  const pieza = piezas.find(p => p.fila === fila && p.col === col);
  if (!pieza || pieza.vacia) return false;

  const cerca =
    (pieza.fila === vacia.fila && Math.abs(pieza.col - vacia.col) === 1) ||
    (pieza.col === vacia.col && Math.abs(pieza.fila - vacia.fila) === 1);

  if (!cerca) return false;

  const ok = intercambiar(pieza, { esMezcla: false });
  if (ok) dibujarPuzzle(imagenActual);
  return ok;
}