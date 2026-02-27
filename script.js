// 1. CONFIGURACION INICIO
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 22, 2027 11:00:00").getTime();

// 2. ANIMACIÓN SCROLL (FADE-IN)
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach((section) => {
    observer.observe(section);
});

// 3. LÓGICA DE RSVP (Ocultar tarjeta, mostrar form)
function showForm() {
    document.getElementById('rsvp-card-start').style.display = 'none';
    document.getElementById('rsvp-form-container').style.display = 'block';
    // Aquí puedes cargar dinámicamente tu formulario JS si lo tienes por separado
}

// 4. CUENTA REGRESIVA
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

// 5. MÚSICA
const music = document.getElementById("music");
const musicBtn = document.getElementById("music-icon");
const musicImg = document.getElementById("music-img");
let isPlaying = false;
if (musicBtn) {
    musicBtn.addEventListener("click", () => {
        if (!isPlaying) {
            music.play().catch(e => console.log("Error:", e));
            if(musicImg) musicImg.src = "pause.png";
        } else {
            music.pause();
            if(musicImg) musicImg.src = "play.png";
        }
        isPlaying = !isPlaying;
    });
}

// 6. LÓGICA RSVP (Carga de datos y bloqueo)
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");
    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            const formContainer = document.getElementById("rsvp-form-container");
            
            // ---  BLOQUEO SI YA EXISTE RESPUESTA ---
            if (data.confirmado === "SI" || data.confirmado === "CANCELADO") {
                const esConfirmada = data.confirmado === "SI";
                
                // Ocultar formulario real
                formContainer.style.display = "none";
                
                // Crear aviso elegante de bloqueo
                const aviso = document.createElement("div");
                aviso.style.padding = "40px 20px";
                aviso.style.background = "#fff";
                aviso.style.borderRadius = "15px";
                aviso.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                aviso.style.margin = "20px auto";
                aviso.style.maxWidth = "500px";

                aviso.innerHTML = `
                    <h2 style="color: ${esConfirmada ? '#D4AF37' : '#ba1a1a'}; margin-bottom: 15px;">
                        ${esConfirmada ? '¡O teu convite foi confirmado!' : 'O teu convite foi cancelado'}
                    </h2>
                    <p style="color: #666; font-size: 1.1em; line-height: 1.6;">
                        Qualquer alteração, por favor contacta diretamente os noivos.
                    </p>
                    <div style="margin-top: 20px; font-size: 2em;">${esConfirmada ? '🥂' : '✉️'}</div>
                `;
                
                document.getElementById('rsvp-section').appendChild(aviso);
                return; 
            }

            // --- SI NO HA CONFIRMADO, CARGAR FORMULARIO DENTRO DE #rsvp-form-container ---
            // AQUÍ DEBES ASEGURARTE QUE TU HTML DEL FORMULARIO EXISTE
            // O GENERARLO DINÁMICAMENTE COMO HICISTE ANTES.
            
            // Re-ejecutar tu lógica de llenado del formulario aquí...
        });
});