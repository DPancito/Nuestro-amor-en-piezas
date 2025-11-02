let nivel = 3;
let piezas = [];
let vaciaIndex = null;
let imagenes = ["images/img1.jpg","images/img2.jpg","images/img3.jpg","images/img4.jpg"];
let imagenActual = imagenes[0];

function iniciarJuego(){
    const sel = document.getElementById("dificultad");
    nivel = parseInt(sel.value);

    document.getElementById("pantalla-inicio").classList.remove("visible");
    document.getElementById("pantalla-juego").classList.add("visible");

    document.getElementById("musica-inicio").pause();
    document.getElementById("musica-juego").play();

    crearTablero();
}

function volverInicio(){
    location.reload();
}

function crearTablero(){
    const tablero = document.getElementById("tablero");
    tablero.innerHTML = "";
    piezas = [];

    tablero.style.gridTemplateColumns = `repeat(${nivel}, 1fr)`;
    tablero.style.gridTemplateRows = `repeat(${nivel}, 1fr)`;

    let total = nivel * nivel;

    // Elegimos una posición única vacía
    vaciaIndex = Math.floor(Math.random()*total);

    for(let i=0; i<total; i++){
        let p = document.createElement("div");
        p.classList.add("pieza");

        if(i !== vaciaIndex){
            p.style.backgroundImage = `url(${imagenActual})`;
            p.style.backgroundSize = `${nivel * 100}% ${nivel * 100}%`;

            let fila = Math.floor(i / nivel);
            let col = i % nivel;
            p.style.backgroundPosition = `${-(col * 100 / (nivel-1))}% ${-(fila * 100 / (nivel-1))}%`;
        } else {
            p.classList.add("vacia");
        }

        p.addEventListener("click", ()=> mover(i));
        piezas.push(p);
        tablero.appendChild(p);
    }
}

function obtenerMovibles(){
    let mov = [];
    let fV = Math.floor(vaciaIndex / nivel);
    let cV = vaciaIndex % nivel;

    [[fV-1,cV],[fV+1,cV],[fV,cV-1],[fV,cV+1]].forEach(([f,c])=>{
        if(f>=0 && f<nivel && c>=0 && c<nivel){
            mov.push(f*nivel + c);
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

function mezclar(){
    for(let i=0;i<200;i++){
        let mov = obtenerMovibles();
        let r = mov[Math.floor(Math.random()*mov.length)];
        intercambiar(r, vaciaIndex);
    }
}

function siguienteImagen(){
    imagenActual = imagenes[Math.floor(Math.random()*imagenes.length)];
    crearTablero();
}

function toggleMute(){
    const m1 = document.getElementById("musica-inicio");
    const m2 = document.getElementById("musica-juego");
    let muted = !m1.muted;
    m1.muted = muted;
    m2.muted = muted;
}

