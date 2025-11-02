// --- VARIABLES ---
let imagenes = [];
let indiceActual = 0;
let filas = 3;
let columnas = 3;
let canvas, ctx;
let piezas = [];
let piezaVacia;
let imgActual = new Image();

// --- CARGAR IMÁGENES ---
fetch('images.json')
  .then(res => res.json())
  .then(data => {
    imagenes = data;
    crearCollage();
  });

// --- CREAR COLLAGE ---
function crearCollage() {
    const collageDiv = document.getElementById("collage");
    collageDiv.innerHTML = '';
    const mostrar = imagenes.slice(0, Math.min(6, imagenes.length));
    mostrar.forEach(src => {
        const img = document.createElement("img");
        img.src = `images/${src}`;
        img.className = "mini-img";
        collageDiv.appendChild(img);
    });
}

// --- AJUSTAR CANVAS ---
function ajustarCanvas() {
    canvas = document.getElementById("puzzleCanvas");
    ctx = canvas.getContext("2d");
    const tamaño = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = tamaño;
    canvas.height = tamaño;
}

// --- MOSTRAR IMAGEN ---
function mostrarImagen(indice = null) {
    if (indice === null) indice = Math.floor(Math.random() * imagenes.length);
    indiceActual = indice;
    imgActual.src = `images/${imagenes[indice]}`;
    imgActual.onload = () => {
        ajustarCanvas();
        piezas = [];
        const piezaAncho = canvas.width / columnas;
        const piezaAlto = canvas.height / filas;

        for (let i = 0; i < filas; i++) {
            for (let j = 0; j < columnas; j++) {
                const esVacia = (i === filas - 1 && j === columnas - 1);
                piezas.push({
                    sx: j * (imgActual.width / columnas),
                    sy: i * (imgActual.height / filas),
                    sw: imgActual.width / columnas,
                    sh: imgActual.height / filas,
                    x: j,
                    y: i,
                    empty: esVacia
                });
                if (esVacia) piezaVacia = {x:j, y:i};
            }
        }
        dibujarPiezas();
    }
}

// --- DIBUJAR PIEZAS ---
function dibujarPiezas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ancho = canvas.width / columnas;
    const alto = canvas.height / filas;
    piezas.forEach(p => {
        if(!p.empty){
            ctx.drawImage(imgActual, p.sx, p.sy, p.sw, p.sh, p.x*ancho, p.y*alto, ancho, alto);
        } else {
            ctx.fillStyle = "#000"; // espacio vacío
            ctx.fillRect(p.x*ancho, p.y*alto, ancho, alto);
        }
    });
}

// --- INICIAR JUEGO ---
function iniciarJuego() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("juego").style.display = "block";

    filas = columnas = parseInt(document.getElementById("dificultad").value);

    // Música
    const audio = document.getElementById("musica");
    audio.currentTime = Math.random() * Math.max(1, audio.duration || 3600 - 10);
    audio.volume = 0;
    audio.play().then(() => fadeIn(audio)).catch(() => console.log("Interacción necesaria para música"));

    mostrarImagen(); // mostrar imagen completa sin mezclar
}

// --- FADE-IN ---
function fadeIn(audio,target=0.5,step=0.02,intervalMs=150){
    const iv = setInterval(()=>{
        audio.volume = Math.min(audio.volume + step,target);
        if(audio.volume>=target) clearInterval(iv);
    },intervalMs);
}

// --- MEZCLAR PIEZAS ---
function mezclarPiezas(){
    for(let i=0;i<1000;i++){
        const adyacentes = piezas.filter(p=> esAdyacenteVacia(p));
        const mover = adyacentes[Math.floor(Math.random()*adyacentes.length)];
        moverPieza(mover,false);
    }
    dibujarPiezas();
}

// --- PIEZA ADYACENTE ---
function esAdyacenteVacia(p){
    const dx = Math.abs(p.x - piezaVacia.x);
    const dy = Math.abs(p.y - piezaVacia.y);
    return (dx+dy)===1;
}

// --- MOVER PIEZA ---
function moverPieza(pieza, redraw=true){
    if(esAdyacenteVacia(pieza)){
        const tempX = pieza.x;
        const tempY = pieza.y;
        pieza.x = piezaVacia.x;
        pieza.y = piezaVacia.y;
        piezaVacia.x = tempX;
        piezaVacia.y = tempY;
        if(redraw) dibujarPiezas();
    }
}

// --- CLIC / TOUCH ---
function manejarClick(e){
    const rect = canvas.getBoundingClientRect();
    const xClick = (e.clientX||e.touches[0].clientX) - rect.left;
    const yClick = (e.clientY||e.touches[0].clientY) - rect.top;
    const ancho = canvas.width / columnas;
    const alto = canvas.height / filas;
    const xPieza = Math.floor(xClick / ancho);
    const yPieza = Math.floor(yClick / alto);

    const pieza = piezas.find(p=>p.x===xPieza && p.y===yPieza);
    if(pieza && !pieza.empty){
        moverPieza(pieza);
        verificarPuzzleCompleto();
    }
}

// --- VERIFICAR COMPLETADO ---
function verificarPuzzleCompleto(){
    let completo = piezas.every((p,i)=>{
        const fila = Math.floor(i/columnas);
        const col = i%columnas;
        return p.x===col && p.y===fila;
    });
    if(completo) document.getElementById("mensaje").innerText="¡Felicidades! 💖 Puzzle completado";
}

// --- SIGUIENTE IMAGEN ---
function siguienteImagen(){
    mostrarImagen();
}

// --- EVENTOS ---
window.addEventListener('resize',()=>{ if(document.getElementById("juego").style.display==="block") dibujarPiezas(); });
canvas = document.getElementById("puzzleCanvas");
canvas.addEventListener('click', manejarClick);
canvas.addEventListener('touchstart', e=>{ e.preventDefault(); manejarClick(e); });
