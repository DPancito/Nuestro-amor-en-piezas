// ==== VARIABLES ====
let canvas = document.getElementById("puzzle");
let ctx = canvas.getContext("2d");
let imagenes = [];
let imagenActual = null;
let nivel = 4; // 4x4
let piezas = [];
let vacia = { fila: 0, col: 0 };

// ==== CARGAR IMÁGENES ====
fetch("images.json")
    .then(r => r.json())
    .then(data => {
        imagenes = data;
    });

// ==== EMPEZAR ====
function empezarJuego() {
    document.getElementById("pantalla-inicio").classList.add("oculto");
    document.getElementById("pantalla-juego").classList.remove("oculto");

    reproducirMusica();
    nuevaImagen();
}

// ==== AUDIO ====
function reproducirMusica() {
    const audio = document.getElementById("musica");
    audio.volume = 0.6;
    audio.play().catch(()=>{});
}

// ==== ELEGIR OTRA IMAGEN ====
function nuevaImagen() {
    if (imagenes.length === 0) return;

    const random = Math.floor(Math.random() * imagenes.length);
    const img = new Image();
    img.src = imagenes[random];

    img.onload = () => {
        imagenActual = img;
        prepararPuzzle(img);
        mezclarPiezas();
    };
}

// ==== PREPARAR PUZZLE ====
function prepararPuzzle(img) {
    // ajustar canvas al dispositivo sin deformar
    let lado = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7);
    canvas.width = lado;
    canvas.height = lado;

    piezas = [];
    const anchoP = lado / nivel;
    const altoP = lado / nivel;

    for (let f = 0; f < nivel; f++) {
        for (let c = 0; c < nivel; c++) {
            let esUltima = (f === nivel - 1 && c === nivel - 1);
            piezas.push({
                fila: f,
                col: c,
                x: c * anchoP,
                y: f * altoP,
                vacia: esUltima
            });
        }
    }

    vacia = piezas[piezas.length - 1];
    dibujarPuzzle(img);
}

// ==== DIBUJAR ====
function dibujarPuzzle(img) {
    ctx.fillStyle = "#ffb7d5"; // fondo rosa suave donde no hay imagen
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sw = img.width / nivel;
    const sh = img.height / nivel;
    const dw = canvas.width / nivel;
    const dh = canvas.height / nivel;

    piezas.forEach(p => {
        if (!p.vacia) {
            ctx.drawImage(
                img,
                p.col * sw, p.fila * sh, sw, sh,
                p.x, p.y, dw, dh
            );
        } else {
            // pieza vacía = negro
            ctx.fillStyle = "#000000";
            ctx.fillRect(p.x, p.y, dw, dh);
        }
    });
}

// ==== MEZCLAR ====
function mezclarPiezas() {
    for (let i = 0; i < 500; i++) moverAleatorio();
    dibujarPuzzle(imagenActual);
}

function moverAleatorio() {
    const ady = piezas.filter(p =>
        !p.vacia &&
        ((Math.abs(p.fila - vacia.fila) === 1 && p.col === vacia.col) ||
        (Math.abs(p.col - vacia.col) === 1 && p.fila === vacia.fila))
    );

    if (ady.length === 0) return;
    const pieza = ady[Math.floor(Math.random() * ady.length)];

    intercambiar(pieza);
}

function intercambiar(p) {
    const tmpX = p.x, tmpY = p.y, tmpF = p.fila, tmpC = p.col;

    p.x = vacia.x; p.y = vacia.y;
    p.fila = vacia.fila; p.col = vacia.col;

    vacia.x = tmpX; vacia.y = tmpY;
    vacia.fila = tmpF; vacia.col = tmpC;
}

// ==== INTERACCIÓN TÁCTIL/CORTE ====
canvas.addEventListener("click", moverSiPosible);
canvas.addEventListener("touchstart", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    moverSiPosible({ offsetX: x, offsetY: y });
});

function moverSiPosible(e) {
    const dw = canvas.width / nivel;
    const dh = canvas.height / nivel;

    const col = Math.floor(e.offsetX / dw);
    const fila = Math.floor(e.offsetY / dh);

    const pieza = piezas.find(p => p.fila === fila && p.col === col);
    if (!pieza || pieza.vacia) return;

    const cerca =
        (pieza.fila === vacia.fila && Math.abs(pieza.col - vacia.col) === 1) ||
        (pieza.col === vacia.col && Math.abs(pieza.fila - vacia.fila) === 1);

    if (cerca) {
        intercambiar(pieza);
        dibujarPuzzle(imagenActual);
    }
}
