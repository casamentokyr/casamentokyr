// 1. CONFIGURACIÓN
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 15, 2027 16:00:00").getTime();

// 2. CUENTA REGRESIVA
function updateCountdown() {
    const now = new Date().getTime();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d;
    document.getElementById("hours").innerText = h;
    document.getElementById("minutes").innerText = m;
    document.getElementById("seconds").innerText = s;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 3. MÚSICA
const music = document.getElementById("music");
const musicBtn = document.getElementById("music-icon");
const musicImg = document.getElementById("music-img");
let isPlaying = false;

if (musicBtn) {
    musicBtn.addEventListener("click", () => {
        if (!isPlaying) {
            music.play();
            musicImg.src = "pause.png";
        } else {
            music.pause();
            musicImg.src = "play.png";
        }
        isPlaying = !isPlaying;
    });
}

// ... (Mantén tu código de cuenta regresiva y música igual) ...

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // 1. SELECTOR DE ADULTOS
            const selectA = document.getElementById("adultos");
            selectA.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
            
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = `${i} Adulto${i > 1 ? 's' : ''} confirmado${i > 1 ? 's' : ''}`;
                selectA.appendChild(opt);
            }
            let optCancel = document.createElement("option");
            optCancel.value = "0";
            optCancel.text = "No podré asistir (Cancelar invitación)";
            selectA.appendChild(optCancel);

            // 2. FUNCIÓN PARA DIBUJAR LA SECCIÓN DE NIÑOS
            const contenedorNinos = document.getElementById("contenedorNinosDinamico");
            
            function actualizarSeccionNinos(asiste) {
                contenedorNinos.innerHTML = ""; // Limpiar

                if (!asiste) {
                    contenedorNinos.innerHTML = '<span class="badge-ninos" style="color:#888;">Invitación cancelada</span>';
                    return;
                }

                if (parseInt(data.ninosPermitidos) === 0 || parseInt(data.ninos) === 0) {
                    // Mensaje elegante cuando no se permiten niños
                    contenedorNinos.innerHTML = '<span class="badge-ninos" style="color:#d4af37; font-style:italic;">Ambiente de solo adultos</span>';
                } else {
                    // Creamos el selector de niños
                    let selectN = document.createElement("select");
                    selectN.id = "ninos";
                    selectN.className = "input-estilo";
                    
                    // Opción por defecto (0 o ninguno)
                    let optNone = document.createElement("option");
                    optNone.value = "0";
                    optNone.text = "Ningún niño asiste";
                    selectN.appendChild(optNone);

                    // Opciones según tu Excel
                    for (let j = 1; j <= data.ninos; j++) {
                        let opt = document.createElement("option");
                        opt.value = j;
                        opt.text = `${j} Niño${j > 1 ? 's' : ''} confirmado${j > 1 ? 's' : ''}`;
                        selectN.appendChild(opt);
                    }
                    contenedorNinos.appendChild(selectN);
                }
            }

            // Inicializar sección niños
            actualizarSeccionNinos(true);

            // 3. EVENTO AL CAMBIAR SELECTOR DE ADULTOS
            selectA.addEventListener("change", function() {
                const contenedorExtra = document.getElementById("contenedorExtra");
                const btn = document.getElementById("btnSubmit");

                if (this.value === "0") {
                    actualizarSeccionNinos(false);
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar Invitación";
                    btn.style.background = "#ba1a1a";
                } else {
                    actualizarSeccionNinos(true);
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.background = "#d4af37";
                }
            });

            // Si ya confirmó previamente
            if (data.confirmado === "SI") {
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                document.getElementById("btnSubmit").innerText = "Ya confirmaste";
            }
        });
});

// Ajuste en el envío del formulario para capturar el valor del nuevo SELECT de niños
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const esCancelado = document.getElementById("adultos").value === "0";
    const selectNinos = document.getElementById("ninos");
    
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: document.getElementById("adultos").value,
        ninos: esCancelado ? 0 : (selectNinos ? selectNinos.value : 0),
        alergias: esCancelado ? "Ninguna" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };
    
    // ... (resto del fetch igual)
});