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

// --- LÓGICA VESTIMENTA (Galería) ---
function openGallery() {
    document.getElementById("dress-gallery").style.display = "flex";
}
function closeGallery() {
    document.getElementById("dress-gallery").style.display = "none";
}

// --- LÓGICA TARJETA REGALOS ---
function toggleGiftCard() {
    const card = document.getElementById("gift-card");
    card.classList.toggle("is-flipped");
}

// 3. LÓGICA DE RSVP (Ocultar tarjeta, mostrar form)
function showForm() {
    document.getElementById('rsvp-card-start').style.display = 'none';
    document.getElementById('rsvp-form-container').style.display = 'block';
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
            const form = document.getElementById("rsvpForm");
            
            // ---  BLOQUEO SI YA EXISTE RESPUESTA ---
            if (data.confirmado === "SI" || data.confirmado === "CANCELADO") {
                const esConfirmada = data.confirmado === "SI";
                
                // Ocultar botonera inicial y formulario
                document.getElementById('rsvp-card-start').style.display = 'none';
                form.style.display = "none";
                
                // Crear aviso elegante de bloqueo
                const aviso = document.createElement("div");
                aviso.style.padding = "40px 20px";
                aviso.style.background = "#fff";
                aviso.style.borderRadius = "15px";
                aviso.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                aviso.style.margin = "20px auto";
                aviso.style.maxWidth = "500px";

                aviso.innerHTML = `
                    <h2 style="color: ${esConfirmada ? '#4F6D8A' : '#ba1a1a'}; margin-bottom: 15px;">
                        ${esConfirmada ? '¡O teu convite foi confirmado!' : 'O teu convite foi cancelado'}
                    </h2>
                    <p style="color: #ffffff; font-size: 1.1em; line-height: 1.6;">
                        Qualquer alteração, por favor contacta diretamente os noivos.
                    </p>
                    <div style="margin-top: 20px; font-size: 2em;">${esConfirmada ? '🥂' : '✉️'}</div>
                `;
                
                document.getElementById('rsvp-form-container').appendChild(aviso);
                document.getElementById('rsvp-form-container').style.display = 'block';
                return; 
            }

            // --- SI NO HA CONFIRMADO, CARGAR DATOS ---
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Convidado";
            
            // Llenar select adultos
            const selectA = document.getElementById("adultos");
            selectA.innerHTML = '<option value="" disabled selected>Seleciona a quantidade...</option>';
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = `${i} Adulto${i > 1 ? 's' : ''}`;
                selectA.appendChild(opt);
            }
            let optCancel = document.createElement("option");
            optCancel.value = "0";
            optCancel.text = "Não poderei comparecer (Cancelar) 💍";
            selectA.appendChild(optCancel);

            // Niños
            const divNinos = document.getElementById("contenedorNinosDinamico");
            if (parseInt(data.ninos) > 0) {
                divNinos.innerHTML = `
                    <div class="campo">
                        <label>Crianças Convidadas (${data.ninos} máx)</label>
                        <select id="ninos" class="input-estilo">
                            <option value="0">Não virão crianças</option>
                        </select>
                    </div>
                `;
                const selectN = document.getElementById("ninos");
                for (let j = 1; j <= data.ninos; j++) {
                    let opt = document.createElement("option");
                    opt.value = j;
                    opt.text = `${j} Criança${j > 1 ? 's' : ''}`;
                    selectN.appendChild(opt);
                }
            }

            // Lógica botón envío
            form.addEventListener("submit", async function(e) {
                e.preventDefault();
                const btn = document.getElementById("btnSubmit");
                const adultosVal = document.getElementById("adultos").value;
                const esCancelado = adultosVal === "0";
                const ninosVal = document.getElementById("ninos") ? document.getElementById("ninos").value : 0;
                
                btn.disabled = true;
                btn.innerText = "A Enviar...";

                const formData = {
                    codigo: document.getElementById("codigo").value,
                    nombre: document.getElementById("nombre").value,
                    adultos: adultosVal,
                    ninos: esCancelado ? 0 : ninosVal,
                    alergias: esCancelado ? "Não" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Não"),
                    comentarios: document.getElementById("comentarios").value,
                    confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
                };

                try {
                    await fetch(SCRIPT_URL, { 
                        method: "POST", 
                        mode: "no-cors", 
                        body: JSON.stringify(formData) 
                    });
                    
                    setTimeout(() => location.reload(), 1500);
                } catch (err) {
                    alert("Erro ao enviar. Tente novamente.");
                    btn.disabled = false;
                    btn.innerText = "Confirmar Presença";
                }
            });
        });
});

// SWITCH ALERGIAS
// SWITCH ALERGIAS - CORREGIDO Y SEGURO
document.addEventListener('DOMContentLoaded', function() {
    const switchAlergia = document.getElementById('switchAlergia');
    const campoAlergia = document.getElementById('campoAlergiaTexto');
    const textoAlergia = document.getElementById('textoAlergia');

    if (switchAlergia && campoAlergia && textoAlergia) {
        // Asegurar estado inicial oculto
        campoAlergia.style.display = 'none';

        switchAlergia.addEventListener('change', function() {
            if (this.checked) {
                campoAlergia.style.display = 'block';
                textoAlergia.innerText = 'Sim';
            } else {
                campoAlergia.style.display = 'none';
                textoAlergia.innerText = 'Não';
                // Limpiar el campo cuando se oculta
                document.getElementById('alergias').value = '';
            }
        });
    }
});