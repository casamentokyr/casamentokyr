// 1. CONFIGURACIÓN
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 15, 2027 16:00:00").getTime();

// 2. CUENTA REGRESIVA
function updateCountdown() {
    const now = new Date().getTime();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
        document.querySelectorAll(".circle span").forEach(el => el.innerText = "0");
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if(document.getElementById("days")) document.getElementById("days").innerText = d;
    if(document.getElementById("hours")) document.getElementById("hours").innerText = h;
    if(document.getElementById("minutes")) document.getElementById("minutes").innerText = m;
    if(document.getElementById("seconds")) document.getElementById("seconds").innerText = s;
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
            music.play().catch(e => console.log("Error al reproducir:", e));
            if(musicImg) musicImg.src = "pause.png";
        } else {
            music.pause();
            if(musicImg) musicImg.src = "play.png";
        }
        isPlaying = !isPlaying;
    });
}

// 4. CARGA DE DATOS Y LÓGICA DE FORMULARIO
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // --- SELECTOR DE ADULTOS ---
            const selectA = document.getElementById("adultos");
            selectA.innerHTML = '<option value="" disabled selected>Selecciona cantidad...</option>';
            
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = `${i} Adulto${i > 1 ? 's' : ''} confirmado${i > 1 ? 's' : ''}`;
                selectA.appendChild(opt);
            }
            
            let optCancel = document.createElement("option");
            optCancel.value = "0";
            optCancel.text = "No podré asistir (Cancelar)";
            selectA.appendChild(optCancel);

            // --- LÓGICA DE NIÑOS Y BOTÓN (EL CAMBIO QUE SOLICITASTE) ---
            const seccionNinos = document.getElementById("seccionNinos");
            const contenedorExtra = document.getElementById("contenedorExtra");
            const btn = document.getElementById("btnSubmit");

            selectA.addEventListener("change", function() {
                if (this.value === "0") {
                    // MODO CANCELAR: Ocultar todo
                    seccionNinos.style.display = "none";
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar Invitación";
                    btn.style.background = "#ba1a1a"; // Rojo
                } else {
                    // MODO ASISTIR: Mostrar extras
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.background = "#d4af37"; // Dorado

                    // Lógica específica para Niños
                    if (parseInt(data.ninosPermitidos) > 0 && parseInt(data.ninos) > 0) {
                        seccionNinos.style.display = "block";
                        const textoNinos = document.getElementById("textoNinos");
                        textoNinos.innerText = `Niños invitados: ${data.ninos}`;
                        
                        // Convertir el input de niños a un selector de cantidad
                        const ninosInput = document.getElementById("ninos");
                        ninosInput.max = data.ninos;
                        ninosInput.value = data.ninos; 
                        ninosInput.style.display = "block";
                    } else {
                        seccionNinos.style.display = "none";
                    }
                }
            });

            if (data.confirmado === "SI") {
                document.getElementById("mensajeConfirmado").style.display = "block";
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                document.getElementById("btnSubmit").innerText = "Ya confirmaste";
            }
        });
});

// 5. SWITCH ALERGIAS
document.getElementById("switchAlergia").addEventListener("change", function() {
    const campo = document.getElementById("campoAlergiaTexto");
    const texto = document.getElementById("textoAlergia");
    campo.style.display = this.checked ? "block" : "none";
    texto.innerText = this.checked ? "Sí" : "No";
});

// 6. ENVÍO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const esCancelado = document.getElementById("adultos").value === "0";
    
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: document.getElementById("adultos").value,
        ninos: esCancelado ? 0 : document.getElementById("ninos").value,
        alergias: esCancelado ? "Ninguna" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(formData) });
        const mensaje = document.getElementById("mensajeExito");
        mensaje.innerHTML = `<div style="background:white; padding:40px; border-radius:15px; text-align:center;">
            <h2>${esCancelado ? 'Cancelado' : '¡Confirmado!'}</h2>
            <p>Tu respuesta ha sido enviada.</p>
        </div>`;
        mensaje.classList.add("show");
        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar");
        btn.disabled = false;
    }
});