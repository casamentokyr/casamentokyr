// SCROLL SUAVE
function scrollDown(){window.scrollBy({top:window.innerHeight,behavior:"smooth"});}

// CUENTA REGRESIVA CIRCULAR
const wedding = new Date("May 15, 2027 16:00:00");

function updateCountdown(){
  const now=new Date();
  const diff=wedding-now;
  if(diff<=0){
    ["days","hours","minutes","seconds"].forEach(id=>document.getElementById(id).textContent=0);
    return;
  }
  const days=Math.floor(diff/1000/60/60/24);
  const hours=Math.floor((diff/1000/60/60)%24);
  const minutes=Math.floor((diff/1000/60)%60);
  const seconds=Math.floor((diff/1000)%60);

  ["days","hours","minutes","seconds"].forEach(id=>{
    const el=document.getElementById(id);
    el.textContent=eval(id);
    el.style.animation="none";
    el.offsetHeight;
    
  });
}
setInterval(updateCountdown,1000);
updateCountdown();

// INVITADOS DINAMICOS
const invitados={ "ana123":{max:1,ninos:false},"bru456":{max:4,ninos:true},"car789":{max:2,ninos:false} };
const urlParams=new URLSearchParams(window.location.search);
const guestCode=urlParams.get("guest");
document.getElementById("codigo").value=guestCode;

if(guestCode && invitados[guestCode]){
  const max=invitados[guestCode].max;
  const ninosPermitidos=invitados[guestCode].ninos;
  const selectPersonas=document.getElementById("personas");
  selectPersonas.innerHTML="";
  for(let i=1;i<=max;i++){
    const opt=document.createElement("option"); opt.value=i; opt.textContent=i;
    selectPersonas.appendChild(opt);
  }
  if(!ninosPermitidos){document.getElementById("ninos-container").style.display="none";}
}else{
  const selectPersonas=document.getElementById("personas");
  selectPersonas.innerHTML="<option value='1'>1</option>";
  document.getElementById("ninos-container").style.display="none";
}

// ICONO MUSICA
const music=document.getElementById("music");
const icon=document.getElementById("music-icon");
const img=document.getElementById("music-img");
let isPlaying=false;
icon.addEventListener("click",()=>{
  if(!isPlaying){music.play();img.src="pause.png";isPlaying=true;}
  else{music.pause();img.src="play.png";isPlaying=false;}
});

// ENVIO FORMULARIO
document.getElementById("form").addEventListener("submit",function(e){
  e.preventDefault();
  const data={nombre:this.nombre.value,codigo:this.codigo.value,personas:this.personas.value,ninos:this.ninos?this.ninos.value:0,mensaje:this.mensaje.value};
  fetch("TU_URL_GOOGLE",{method:"POST",body:JSON.stringify(data)});
  alert("¡Confirmación enviada! Gracias por celebrar con nosotros.");
  this.reset();
});



function evitarNegativos(input){
if(input.value < 0){
input.value = 0;
}
}


// NIÑOS 

// --- LÓGICA DE NIÑOS ACTUALIZADA ---
const ninosInput = document.getElementById("ninos");
const textoNinos = document.getElementById("textoNinos");

// Suponiendo que 'data' es el objeto que recibes de Google Sheets
if (data.ninosPermitidos == 0 || data.ninos == 0) {
    // Caso: No se permiten niños
    textoNinos.innerText = "Niños no permitidos";
    textoNinos.style.color = "#888"; // Color gris de desactivado
    ninosInput.style.display = "none"; // Escondemos el input
    ninosInput.value = 0;
} else {
    // Caso: Sí se permiten niños
    textoNinos.innerText = `Niños invitados: ${data.ninos}`;
    textoNinos.style.color = "#333";
    ninosInput.style.display = "block"; // Mostramos el input
    ninosInput.max = data.ninos; // Límite máximo según la tabla
    ninosInput.value = data.ninos; // Valor por defecto el máximo
}