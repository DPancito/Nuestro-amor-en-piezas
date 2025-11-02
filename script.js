let nivel = 3;
let imagenes = [
    "imagenes/foto1.jpg",
    "imagenes/foto2.jpg",
    "imagenes/foto3.jpg",
    "imagenes/foto4.jpg"
];

let imagenActual = 0;
let piezas = [];
let cuadroVacio;
let canvas, ctx;
let tam, piezaTam;

function cambiarNivel(n) {
    nivel = n;
}

function comenzar() {
    document.getElementById("inicio").classList.add("oculto");
    document.getElementById("juego").classList.remove("oculto");
    cargarImagen();
}

function volverInicio() {
    document.getElementById("juego").classList.add("oculto");
    document.getElementById("inicio").classList.remove("oculto");
}

function nuevaImagen() {
    imagenActual = (imagenActual + 1) % imagenes.length;
    cargarImagen();
}

function cargarImagen() {
    const img = new Image();
    img.src = imagenes[imagenActual];
    img.onload = () => iniciarPuzzle(img);
}

function iniciarPuzzle(img) {
    canvas = document.getElementById("tablero");
    ctx = canvas.getContext("2d");

    tam = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7);
    canvas.width = tam;
    canvas.height = tam;
    piezaTam = tam / nivel;

    piezas = [];
    
    // Dividir imagen
    for (let y = 0; y < nivel; y++) {
        for (let x = 0; x < nivel; x++) {
            piezas.push({
                xReal: x,
                yReal: y,
                xAct: x,
                yAct: y,
                img: img
            });
        }
    }

    // Crear SOLO 1 cuadro vacío (último)
    cuadroVacio = piezas.pop(); 

    barajar();
    dibujar();
}

function barajar() {
    for (let i = piezas.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        [piezas[i], piezas[j]] = [piezas[j], piezas[i]];
    }
    dibujar();
}

function dibujar() {
    ctx.clearRect(0, 0, tam, tam);

    piezas.forEach(p => {
        ctx.drawImage(
            p.img,
            p.xReal * (p.img.width / nivel),
            p.yReal * (p.img.height / nivel),
            p.img.width / nivel,
            p.img.height / nivel,
            p.xAct * piezaTam,
            p.yAct * piezaTam,
            piezaTam,
            piezaTam
        );
    });

    // ✅ El cuadro vacío se pinta rosa suave (visual)
    ctx.fillStyle = "#ff69b4";
    ctx.fillRect(cuadroVacio.xAct * piezaTam, cuadroVacio.yAct * piezaTam, piezaTam, piezaTam);
}

canvas?.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / piezaTam);
    const y = Math.floor((e.clientY - rect.top) / piezaTam);

    let pieza = piezas.find(p => p.xAct === x && p.yAct === y);
    if (!pieza) return;

    let dx = Math.abs(pieza.xAct - cuadroVacio.xAct);
    let dy = Math.abs(pieza.yAct - cuadroVacio.yAct);

    // ✅ Movimiento solo si está al lado
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        let tempX = pieza.xAct, tempY = pieza.yAct;
        pieza.xAct = cuadroVacio.xAct;
        pieza.yAct = cuadroVacio.yAct;
        cuadroVacio.xAct = tempX;
        cuadroVacio.yAct = tempY;
        dibujar();
    }
});


