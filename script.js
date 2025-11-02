let canvas = document.getElementById("puzzle");
let ctx = canvas.getContext("2d");

let imagenes = [];
let imagenActual = null;
let nivel = 4; // 4x4
let piezas = [];
let vacia = null;

// Cargar lista de imágenes
fetch("images.json")
    .then(r => r.json())
    .then(data => imagenes = data);

function empezarJuego() {
    document.getElementById("pantalla-inicio").classList.add("oculto");
    document.getElementById("pantalla-juego").classList.remove("oculto");
    reproducirMusica();
    nuevaImagen();
}

function reproducirMusica() {
    const audio = document.getElementById("musica");
    audio.volume = 0.7;
    audio.play().catch(()=>{});
}

function nuevaImagen() {
    if (imagenes.length === 0) return;
    const random = Math.floor(Math.random() * imagenes.length);

    const img = new Image();
    img.src = imagenes[random];

    img.onload = () => {
        imagenActual = img;
        prepararPuzzle();
        mezclarPiezas();
    };
}

function prepararPuzzle() {
    // Ajuste correcto de tamaño para PC y móvil
    const lado = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.8);
    canvas.width = lado;
    canvas.height = lado;

    piezas = [];
    const dw = lado / nivel;
    const dh = lado / nivel;

    for (let f = 0; f < nivel; f++) {
        for (let c = 0; c < nivel; c++) {
            piezas.push({
                fila: f,
                col: c,
                x: c * dw,
                y: f * dh,
                vacia: false
            });
        }
    }

    // ✅ Solo UNA pieza vacía
    vacia = piezas[piezas.length - 1];
    vacia.vacia = true;

    dibujarPuzzle();
}

function dibujarPuzzle() {
    ctx.fillStyle = "#ffbad9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sw = imagenActual.width / nivel;
    const sh = imagenActual.height / nivel;
    const dw = canvas.width / nivel;
    const dh = canvas.height / nivel;

    piezas.forEach(p => {
        if (!p.vacia) {
            ctx.drawImage(
                imagenActual,
                p.col * sw, p.fila * sh, sw, sh,
                p.x, p.y, dw, dh
            );
        } else {
            // ✅ pieza vacía única (rosa)
            ctx.fillStyle = "#000000";
            ctx.fillRect(p.x, p.y, dw, dh);
        }
    });
}

function mezclarPiezas() {
    for (let i = 0; i < 500; i++) moverAleatorio();
    dibujarPuzzle();
}

function moverAleatorio() {
    const movibles = piezas.filter(p =>
        !p.vacia &&
        ((Math.abs(p.col - vacia.col) === 1 && p.fila === vacia.fila) ||
         (Math.abs(p.fila - vacia.fila) === 1 && p.col === vacia.col))
    );

    if (movibles.length === 0) return;

    cambiar(movibles[Math.floor(Math.random() * movibles.length)]);
}

function cambiar(p) {
    const temp = { x: p.x, y: p.y, fila: p.fila, col: p.col };
    p.x = vacia.x; p.y = vacia.y;
    p.fila = vacia.fila; p.col = vacia.col;
    vacia.x = temp.x; vacia.y = temp.y;
    vacia.fila = temp.fila; vacia.col = temp.col;
}

canvas.addEventListener("click", moverManual);
canvas.addEventListener("touchstart", e => {
    const r = canvas.getBoundingClientRect();
    moverManual({
        offsetX: e.touches[0].clientX - r.left,
        offsetY: e.touches[0].clientY - r.top
    });
});

function moverManual(e) {
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
        cambiar(pieza);
        dibujarPuzzle();
    }
}

