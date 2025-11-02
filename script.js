let imagenes = [];
let indiceActual = 0;

// --- Cargar imágenes desde JSON ---
fetch('images.json')
  .then(res => res.json())
  .then(data => {
      imagenes = data;
      console.log("Imágenes cargadas:", imagenes.length);
  });

// --- Mostrar imagen centrada y escalada ---
function mostrarImagen(indice) {
    const img = new Image();
    img.src = `images/${imagenes[indice]}`;
    img.onload = () => {
        const canvas = document.getElementById("puzzleCanvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Escalar y centrar manteniendo proporción
        let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        let x = (canvas.width - img.width * ratio) / 2;
        let y = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(img, x, y, img.width * ratio, img.height * ratio);
    };
}

// --- Iniciar juego ---
function iniciarJuego() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("juego").style.display = "block";

    // Reproducir música al interactuar
    const audio = document.getElementById("musica");
    audio.currentTime = Math.random() * Math.max(1, audio.duration || 3600 - 10);
    audio.volume = 0;
    audio.play().then(() => fadeIn(audio)).catch(() => console.log("La música necesita interacción del usuario"));

    mostrarImagen(indiceActual);
}

// --- Fade-in suave ---
function fadeIn(audio, target = 0.5, step = 0.02, intervalMs = 150) {
    const iv = setInterval(() => {
        audio.volume = Math.min(audio.volume + step, target);
        if (audio.volume >= target) clearInterval(iv);
    }, intervalMs);
}

// --- Pasar a siguiente imagen ---
function siguienteImagen() {
    indiceActual = (indiceActual + 1) % imagenes.length;
    mostrarImagen(indiceActual);
}

// --- Mezclar placeholder ---
function mezclar() {
    // Aquí puedes agregar la lógica del puzzle
    document.getElementById("mensaje").innerText = "¡Puzzle mezclado!";
}

