let filas = 5;
let columnas = 5;
let piezas = [];
let vaciaIndex = null;
let imagenes = ["img1.jpg","img2.jpg","img3.jpg"];
let imagenActual = imagenes[0];

/* ===== NAVEGACIÓN PANTALLAS ===== */
function iniciarJuego(){
    ocultar("pantalla-inicio");
    mostrar("pantalla-juego");

    document.getElementById("musica-inicio").pause();
    document.getElementById("musica-juego").play();

    crearTablero();
}

function mostrarNiveles(){
    ocultar("pantalla-inicio");
    mostrar("pantalla-niveles");
}

function setNivel(n){
    filas = columnas = n;
    ocultar("pantalla-niveles");
    mostrar("pantalla-juego");
    document.getElementById("musica-inicio").pause();
    document.getElementById("musica-juego").play();
    crearTablero();
}

function volverInicio(){
    location.reload();
}

function mostrar(id){ document.getElementById(id).classList.add("visible"); }
function ocultar(id){ document.getElementById(id).classList.remove("visible"); }


/* ===== CREAR TABLERO SIN MEZCLAR ===== */
function crearTablero(){
    const tablero = document.getElementById("tablero");
    tablero.innerHTML = "";
    piezas = [];

    tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
    tablero.style.gridTemplateRows = `repeat(${filas}, 1fr)`;

    let total = filas * columnas;
    let vaciaPos = Math.floor(Math.random()*total);
    vaciaIndex = vaciaPos;

    for(let i=0;i<total;i++){
        let d = document.createElement("div");
        d.classList.add("pieza");
        piezas.push(d);

        if(i === vaciaPos){
            d.classList.add("vacia");
        } else {
            d.style.backgroundImage = `url(${imagenActual})`;
        }

        d.addEventListener("click", ()=> mover(i));
        tablero.appendChild(d);
    }
}

/* ===== MEZCLAR SOLO AL APRETAR ===== */
function mezclar(){
    for(let i=0;i<200;i++){
        let movibles = obtenerMovibles();
        let r = movibles[Math.floor(Math.random()*movibles.length)];
        intercambiar(r, vaciaIndex);
    }
}

function obtenerMovibles(){
    let mov = [];
    let fV = Math.floor(vaciaIndex / columnas);
    let cV = vaciaIndex % columnas;

    [[fV-1,cV],[fV+1,cV],[fV,cV-1],[fV,cV+1]].forEach(([f,c])=>{
        if(f>=0 && f<filas && c>=0 && c<columnas){
            mov.push(f*columnas + c);
        }
    });

    return mov;
}

function mover(i){
    if(obtenerMovibles().includes(i)){
        intercambiar(i, vaciaIndex);
    }
}

function intercambiar(i,j){
    let a = piezas[i];
    let b = piezas[j];

    let tmp = a.style.backgroundImage;
    a.style.backgroundImage = b.style.backgroundImage;
    b.style.backgroundImage = tmp;

    a.classList.toggle("vacia");
    b.classList.toggle("vacia");

    vaciaIndex = i;
}

/* ===== CAMBIAR IMAGEN ===== */
function cargarOtraImagen(){
    imagenActual = imagenes[Math.floor(Math.random()*imagenes.length)];
    crearTablero();
}

/* ===== MUTE ===== */
function toggleMute(){
    const m1 = document.getElementById("musica-inicio");
    const m2 = document.getElementById("musica-juego");

    let muted = !m1.muted;
    m1.muted = muted;
    m2.muted = muted;

    document.getElementById("mute-btn").innerHTML = muted ? "🔇" : "🔊";
}


