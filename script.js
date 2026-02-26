// CONFIGURACIÓN
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 15, 2027 16:00:00");

// 1. CUENTA REGRESIVA
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    
    if (diff <= 0) return;

    const parts = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };

    Object.keys(parts).forEach(id => {
        const el = document.getElementById(id);
        if (el && el.textContent != parts[id]) {
            el.textContent = parts[id];
        }
    });
}
setInterval(updateCountdown, 1000);

// 2. MÚSICA
const music = document.getElementById("music");
const musicBtn = document.getElementById("music-icon");
const musicImg = document.getElementById("music-img");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
    if (!isPlaying) {
        music.play().catch(() => alert("Interactúa con la página primero para sonar la música"));
        musicImg.src = "pause.png";
    } else {
        music.pause();
        musicImg.src = "play.png";
    }
    isPlaying = !isPlaying;
});

// 3. CARGA DE DATOS DEL INVITADO
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre;
            
            // Lógica de Adultos
            const adultosInput = document.getElementById("adultos");
            adultosInput.max = data.adultos;
            adultosInput.value = data.adultos;

            // Lógica de Niños (Tu solicitud principal)
            const ninosInput = document.getElementById("ninos");
            const textoNinos = document.getElementById("textoNinos");

            if (data.ninosPermitidos == 0 || data.ninos == 0) {
                textoNinos.innerText = "Niños no permitidos";
                textoNinos.classList.add("disabled");
                ninosInput.style.display = "none";
                ninosInput.value = 0;
            } else {
                textoNinos.innerText = `Niños invitados: ${data.ninos}`;
                ninosInput.style.display = "block";
                ninosInput.max = data.ninos;
                ninosInput.value = data.ninos;
            }

            // Si ya confirmó
            if (data.confirmado === "SI") {
                document.getElementById("mensajeConfirmado").style.display = "block";
                document.getElementById("rsvpForm").classList.add("form-bloqueado");
                document.getElementById("btnSubmit").disabled = true;
                document.getElementById("btnSubmit").innerText = "Asistencia ya confirmada";
            }
        });
});

// 4. SWITCH ALERGIAS
document.getElementById("switchAlergia").addEventListener("change", function() {
    const campo = document.getElementById("campoAlergiaTexto");
    const texto = document.getElementById("textoAlergia");
    campo.style.display = this.checked ? "block" : "none";
    texto.innerText = this.checked ? "Sí" : "No";
});

// 5. ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    if (this.classList.contains("form-bloqueado")) return;

    const btn = document.getElementById("btnSubmit");
    btn.innerText = "Enviando...";
    btn.disabled = true;

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: document.getElementById("adultos").value,
        ninos: document.getElementById("ninos").value,
        alergias: document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna",
        comentarios: document.getElementById("comentarios").value
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(formData)
        });

        const mensaje = document.getElementById("mensajeExito");
        mensaje.innerHTML = `<div class="mensaje-box"><h2>¡Gracias!</h2><p>Confirmación enviada correctamente.</p></div>`;
        mensaje.classList.add("show");

        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar. Intenta de nuevo.");
        btn.disabled = false;
        btn.innerText = "Confirmar asistencia";
    }
});