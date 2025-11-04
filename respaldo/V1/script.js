// --- MÚSICA ---
function fadeIn(audio, target = 0.5, step = 0.02, intervalMs = 150) {
    audio.volume = 0;
    const iv = setInterval(() => {
        audio.volume = Math.min(audio.volume + step, target);
        if (audio.volume >= target) clearInterval(iv);
    }, intervalMs);
}

function reproducirMusicaUnaHora() {
    const audio = document.getElementById('musica');
    // Enlace directo de Google Drive
    audio.src = "https://drive.google.com/uc?export=download&id=1Y54P-U7ovvoRYXS6FxHMwrfW-E8ZOCRj";
    audio.currentTime = Math.random() * Math.max(1, audio.duration - 10 || 3600);
    audio.play().then(() => fadeIn(audio)).catch(err => console.warn('Autoplay bloqueado', err));
}

// --- PUZZLE ---
let canvas = document.getElementById("puzzleCanvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let rows = 3, cols = 3;
let puzzle = [];
let tileSize;
let empty = {x:0, y:0};
let indiceImagen = 0;
let imagenes = [];

// --- Cargar imágenes ---
async function cargarImagenes() {
    const resp = await fetch("images.json");
    imagenes = await resp.json();
    cargarImagenActual();
}

function cargarImagenActual() {
    img.src = "images/" + imagenes[indiceImagen];
    img.onload = () => {
        iniciarPuzzle();
        fadeCanvas();
    };
}

function siguienteImagen() {
    indiceImagen = (indiceImagen +1) % imagenes.length;
    cargarImagenActual();
}

// --- Inicializar puzzle ---
function iniciarPuzzle() {
    rows = parseInt(document.getElementById("dificultad").value);
    cols = rows;
    puzzle = [];
    tileSize = canvas.width / cols;

    for(let y=0; y<rows; y++){
        puzzle[y]=[];
        for(let x=0; x<cols; x++){
            puzzle[y][x]={x:x, y:y};
        }
    }

    empty = {x:cols-1, y:rows-1};
    puzzle[empty.y][empty.x] = null;

    dibujarPuzzle();
}

// --- Dibujar puzzle ---
function dibujarPuzzle() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0; y<rows; y++){
        for(let x=0; x<cols; x++){
            const tile = puzzle[y][x];
            if(tile){
                ctx.drawImage(img, tile.x*tileSize, tile.y*tileSize, tileSize, tileSize,
                    x*tileSize, y*tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = "black";
                ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
            }
            ctx.strokeStyle = "white";
            ctx.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
        }
    }
}

// --- Mezclar puzzle ---
function mezclar() {
    let moves = rows*cols*10;
    for(let i=0;i<moves;i++){
        let vecinos = obtenerVecinos();
        let mover = vecinos[Math.floor(Math.random()*vecinos.length)];
        moverPieza(mover.x, mover.y);
    }
}

function obtenerVecinos() {
    const vecinos=[];
    if(empty.x>0) vecinos.push({x:empty.x-1, y:empty.y});
    if(empty.x<cols-1) vecinos.push({x:empty.x+1, y:empty.y});
    if(empty.y>0) vecinos.push({x:empty.x, y:empty.y-1});
    if(empty.y<rows-1) vecinos.push({x:empty.x, y:empty.y+1});
    return vecinos;
}

function moverPieza(x,y) {
    puzzle[empty.y][empty.x] = puzzle[y][x];
    puzzle[y][x] = null;
    empty.x = x;
    empty.y = y;
    dibujarPuzzle();
    if(verificarCompleto()) mostrarVale();
}

// --- Verificar puzzle ---
function verificarCompleto() {
    for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
            const tile=puzzle[y][x];
            if(tile && (tile.x!==x || tile.y!==y)) return false;
        }
    }
    return true;
}

// --- Vales sorpresa ---
const vales = [
    "💋 Un beso especial",
    "🌹 Una cita romántica",
    "🎁 Una sorpresa dulce",
    "💌 Un mensaje de amor",
    "🍫 Chocolate para ti"
];

function mostrarVale() {
    const msg = document.getElementById("mensaje");
    msg.textContent = vales[Math.floor(Math.random()*vales.length)];
    msg.style.opacity = 1;
    setTimeout(()=> msg.style.opacity=0, 4000);
    crearCorazones(5);
}

// --- Corazones ---
function crearCorazones(cantidad=5){
    for(let i=0;i<cantidad;i++){
        const heart = document.createElement("div");
        heart.className="heart";
        heart.style.left = Math.random()*canvas.width+"px";
        heart.style.top = canvas.offsetTop + canvas.height + "px";
        heart.style.animationDuration = (3 + Math.random()*2) + "s";
        document.body.appendChild(heart);
        setTimeout(()=> heart.remove(), 3000);
    }
}

// --- Fade entre imágenes ---
function fadeCanvas(){
    canvas.style.opacity=0;
    let op=0;
    const step=0.02;
    const interval=setInterval(()=>{
        op+=step;
        canvas.style.opacity=op;
        if(op>=1) clearInterval(interval);
    },30);
}

// --- Click en puzzle ---
canvas.addEventListener("click", function(e){
    const rect=canvas.getBoundingClientRect();
    const x=Math.floor((e.clientX-rect.left)/tileSize);
    const y=Math.floor((e.clientY-rect.top)/tileSize);
    const dx=Math.abs(x-empty.x);
    const dy=Math.abs(y-empty.y);
    if((dx===1 && dy===0)||(dx===0 && dy===1)) moverPieza(x,y);
});

// --- Eventos ---
document.getElementById("btnIniciar").addEventListener("click", ()=>{
    document.getElementById("pantalla-inicio").classList.add("oculto");
    document.getElementById("contenedor").classList.remove("oculto");
    reproducirMusicaUnaHora();
    cargarImagenes();
});

document.getElementById("btnMezclar").addEventListener("click", mezclar);
document.getElementById("btnSiguiente").addEventListener("click", siguienteImagen);
