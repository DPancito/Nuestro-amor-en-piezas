let imagenes = [];
let indiceActual = 0;
let filas = 3;
let columnas = 3;
let canvas, ctx;
let piezas = [];
let piezaVacia; // posición de la pieza vacía para puzzle deslizante

// --- Cargar imágenes ---
fetch('images.json')
  .then(res => res.json())
  .then(data => imagenes = data);

// --- Inicializar canvas ---
function ajustarCanvas() {
    canvas = document.getElementById("puzzleCanvas");
    ctx = canvas.getContext("2d");
    const tamaño = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = tamaño;
    canvas.height = tamaño;
}

// --- Mostrar imagen y crear piezas ---
function mostrarImagen(indice = null) {
    if (indice === null) indice = Math.floor(Math.random() * imagenes.length);
    indiceActual = indice;

    const img = new Image();
    img.src = `images/${imagenes[indice]}`;
    img.onload = () => {
        ajustarCanvas();
        piezas = [];

        const piezaAncho = canvas.width / columnas;
        const piezaAlto = canvas.height / filas;

        // Crear piezas con posiciones originales
        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                piezas.push({
                    sx: j * (img.width / columnas),
                    sy: i * (img.height / filas),
                    sw: img.width / columnas,
                    sh: img.height / filas,
                    x: j,
                    y: i,
                    dx: j * piezaAncho,
                    dy: i * piezaAlto
                });
            }
        }

        // Última pieza vacía
        piezaVacia = {x: columnas-1, y: filas-1};
        piezas[piezas.length-1].empty = true;

        mezclarPiezas();
        dibujarPiezas(img);
        canvas.addEventListener('click', e => manejarClick(e, img));
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            manejarClick(e.touches[0], img);
        });
    };
}

// --- Dibujar piezas ---
function dibujarPiezas(img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    piezas.forEach(p => {
        if (!p.empty) {
            const ancho = canvas.width / columnas;
            const alto = canvas.height / filas;
            ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.x*ancho, p.y*alto, ancho, alto);
        }
    });
}

// --- Iniciar juego ---
function iniciarJuego() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("juego").style.display = "block";

    filas = columnas = parseInt(document.getElementById("dificultad").value);

    const audio = document.getElementById("musica");
    audio.currentTime = Math.random() * Math.max(1, audio.duration || 3600 - 10);
    audio.volume = 0;
    audio.play().then(() => fadeIn(audio)).catch(() => console.log("La música necesita interacción"));

    mostrarImagen();
}

// --- Fade-in ---
function fadeIn(audio, target=0.5, step=0.02, intervalMs=150) {
    const iv = setInterval(() => {
        audio.volume = Math.min(audio.volume + step, target);
        if (audio.volume >= target) clearInterval(iv);
    }, intervalMs);
}

// --- Mezclar piezas ---
function mezclarPiezas() {
    for (let i = 0; i < 1000; i++) { // movimientos aleatorios
        const adyacentes = piezas.filter(p => esAdyacenteVacia(p));
        const mover = adyacentes[Math.floor(Math.random() * adyacentes.length)];
        moverPieza(mover);
    }
}

// --- Ver si pieza es adyacente a vacía ---
function esAdyacenteVacia(pieza) {
    const dx = Math.abs(pieza.x - piezaVacia.x);
    const dy = Math.abs(pieza.y - piezaVacia.y);
    return (dx+dy) === 1;
}

// --- Mover pieza ---
function moverPieza(pieza) {
    if (esAdyacenteVacia(pieza)) {
        const tempX = pieza.x;
        const tempY = pieza.y;
        pieza.x = piezaVacia.x;
        pieza.y = piezaVacia.y;
        piezaVacia.x = tempX;
        piezaVacia.y = tempY;
        const img = new Image();
        img.src = `images/${imagenes[indiceActual]}`;
        img.onload = () => dibujarPiezas(img);
    }
}

// --- Manejar clic/tap ---
function manejarClick(e, img) {
    const rect = canvas.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    const yClick = e.clientY - rect.top;
    const ancho = canvas.width / columnas;
    const alto = canvas.height / filas;
    const xPieza = Math.floor(xClick / ancho);
    const yPieza = Math.floor(yClick / alto);

    const pieza = piezas.find(p => p.x === xPieza && p.y === yPieza) || null;
    if (pieza && !pieza.empty && esAdyacenteVacia(pieza)) {
        moverPieza(pieza);
        verificarPuzzleCompleto();
    }
}

// --- Verificar si puzzle completado ---
function verificarPuzzleCompleto() {
    let completo = piezas.every((p, i) => {
        const fila = Math.floor(i / columnas);
        const col = i % columnas;
        return p.x === col && p.y === fila;
    });
    if (completo) {
        document.getElementById("mensaje").innerText = "¡Felicidades! 💖 Puzzle completado";
    }
}

// --- Ajustar canvas al cambiar tamaño ---
window.addEventListener('resize', () => {
    if (document.getElementById("juego").style.display === "block") {
        mostrarImagen(indiceActual);
    }
});
