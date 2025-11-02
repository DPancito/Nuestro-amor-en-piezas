let imagenes = [];
let indiceActual = 0;
let piezas = [];
let filas = 3;
let columnas = 3;

// --- Cargar imágenes desde JSON ---
fetch('images.json')
  .then(res => res.json())
  .then(data => {
      imagenes = data;
      console.log("Imágenes cargadas:", imagenes.length);
  });

// --- Canvas responsivo ---
function ajustarCanvas() {
    const canvas = document.getElementById("puzzleCanvas");
    const tamaño = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = tamaño;
    canvas.height = tamaño;
}

// --- Mostrar imagen y crear piezas ---
function mostrarImagen(indice = null) {
    if (indice === null) {
        indice = Math.floor(Math.random() * imagenes.length);
    }
    indiceActual = indice;

    const img = new Image();
    img.src = `images/${imagenes[indice]}`;
    img.onload = () => {
        const canvas = document.getElementById("puzzleCanvas");
        const ctx = canvas.getContext("2d");
        ajustarCanvas();

        // Escalar imagen al canvas
        let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        let x0 = (canvas.width - img.width * ratio) / 2;
        let y0 = (canvas.height - img.height * ratio) / 2;

        // Crear piezas
        piezas = [];
        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                piezas.push({
                    sx: j * (img.width / columnas),
                    sy: i * (img.height / filas),
                    sw: img.width / columnas,
                    sh: img.height / filas,
                    dx: j * (canvas.width / columnas) + x0,
                    dy: i * (canvas.height / filas) + y0,
                    dw: canvas.width / columnas,
                    dh: canvas.height / filas
                });
            }
        }

        dibujarPiezas(img);
    };
}

// --- Dibujar piezas ---
function dibujarPiezas(img) {
    const canvas = document.getElementById("puzzleCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    piezas.forEach(p => {
        ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh);
    });
}

// --- Iniciar juego ---
function iniciarJuego() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("juego").style.display = "block";

    filas = columnas = parseInt(document.getElementById("dificultad").value);

    // Música aleatoria
    const audio = document.getElementById("musica");
    audio.currentTime = Math.random() * Math.max(1, audio.duration || 3600 - 10);
    audio.volume = 0;
    audio.play()
        .then(() => fadeIn(audio))
        .catch(() => console.log("La música necesita interacción del usuario"));

    mostrarImagen();
}

// --- Fade-in música ---
function fadeIn(audio, target = 0.5, step = 0.02, intervalMs = 150) {
    const iv = setInterval(() => {
        audio.volume = Math.min(audio.volume + step, target);
        if (audio.volume >= target) clearInterval(iv);
    }, intervalMs);
}

// --- Mezclar piezas ---
function mezclar() {
    // Shuffle array
    for (let i = piezas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [piezas[i].dx, piezas[j].dx] = [piezas[j].dx, piezas[i].dx];
        [piezas[i].dy, piezas[j].dy] = [piezas[j].dy, piezas[i].dy];
    }

    const img = new Image();
    img.src = `images/${imagenes[indiceActual]}`;
    img.onload = () => dibujarPiezas(img);
    document.getElementById("mensaje").innerText = "¡Puzzle mezclado!";
}

// --- Siguiente imagen ---
function siguienteImagen() {
    mostrarImagen();
}

// --- Ajustar canvas al cambiar tamaño de pantalla ---
window.addEventListener('resize', () => {
    if (document.getElementById("juego").style.display === "block") {
        mostrarImagen(indiceActual);
    }
});
