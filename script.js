// 1. CONFIGURACIÓN
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 15, 2027 16:00:00");

// 2. CUENTA REGRESIVA
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;
    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if(document.getElementById("days")) document.getElementById("days").innerText = days;
    if(document.getElementById("hours")) document.getElementById("hours").innerText = hours;
    if(document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
    if(document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
}
setInterval(updateCountdown, 1000);

// 3. MÚSICA
const music = document.getElementById("music");
const musicBtn = document.getElementById("music-icon");
const musicImg = document.getElementById("music-img");
let isPlaying = false;

if (musicBtn) {
    musicBtn.addEventListener("click", () => {
        if (!isPlaying) {
            music.play().catch(e => console.log("Error musica:", e));
            if(musicImg) musicImg.src = "pause.png";
        } else {
            music.pause();
            if(musicImg) musicImg.src = "play.png";
        }
        isPlaying = !isPlaying;
    });
}

// 4. CARGA DE DATOS (Lo que pediste de los niños)
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // Adultos
            const adultosInput = document.getElementById("adultos");
            adultosInput.max = data.adultos;
            adultosInput.value = data.adultos;

            // Lógica de Niños corregida
            const ninosInput = document.getElementById("ninos");
            const textoNinos = document.getElementById("textoNinos");

            if (parseInt(data.ninosPermitidos) === 0 || parseInt(data.ninos) === 0) {
                textoNinos.innerText = "Niños no permitidos";
                textoNinos.style.color = "#888"; 
                ninosInput.style.display = "none";
                ninosInput.value = 0;
            } else {
                textoNinos.innerText = `Niños invitados: ${data.ninos}`;
                textoNinos.style.color = "#333";
                ninosInput.style.display = "block";
                ninosInput.max = data.ninos;
                ninosInput.value = data.ninos;
            }

            // Si ya confirmó
            if (data.confirmado === "SI") {
                document.getElementById("mensajeConfirmado").style.display = "block";
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                document.getElementById("btnSubmit").disabled = true;
                document.getElementById("btnSubmit").innerText = "Asistencia ya confirmada";
            }
        });
});

// 5. SWITCH ALERGIAS
const switchAlergia = document.getElementById("switchAlergia");
if (switchAlergia) {
    switchAlergia.addEventListener("change", function() {
        const campo = document.getElementById("campoAlergiaTexto");
        const texto = document.getElementById("textoAlergia");
        campo.style.display = this.checked ? "block" : "none";
        texto.innerText = this.checked ? "Sí" : "No";
    });
}

// 6. ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
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
        mensaje.innerHTML = `<div style="background:white; padding:40px; border-radius:15px; text-align:center; box-shadow:0 0 20px rgba(0,0,0,0.2);">
            <h2 style="color:#d4af37;">¡Confirmado!</h2>
            <p>Gracias por acompañarnos.</p>
        </div>`;
        mensaje.classList.add("show");

        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar. Intenta de nuevo.");
        btn.disabled = false;
        btn.innerText = "Confirmar asistencia";
    }
});