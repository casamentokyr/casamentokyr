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

// 4. CARGA DE DATOS Y LÓGICA DE CANCELACIÓN
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // Generar opciones de Adultos + Opción Cancelar
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

            // EVENTO CUANDO CAMBIAN EL SELECTOR
            selectA.addEventListener("change", function() {
                const seccionNinos = document.getElementById("seccionNinos");
                const contenedorExtra = document.getElementById("contenedorExtra");
                const btn = document.getElementById("btnSubmit");

                if (this.value === "0") {
                    // SI CANCELA: Ocultamos todo
                    seccionNinos.style.display = "none";
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar Invitación";
                    btn.style.background = "#ba1a1a"; // Rojo
                } else {
                    // SI ASISTE: Revisamos si hay niños para mostrar la sección
                    if (parseInt(data.ninosPermitidos) > 0 && data.ninos > 0) {
                        seccionNinos.style.display = "block";
                        document.getElementById("textoNinos").innerText = `Niños invitados: ${data.ninos}`;
                        document.getElementById("ninos").max = data.ninos;
                        document.getElementById("ninos").value = data.ninos;
                    } else {
                        seccionNinos.style.display = "none";
                    }
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.background = "#d4af37"; // Dorado
                }
            });

            // Si ya confirmó previamente
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
    document.getElementById("campoAlergiaTexto").style.display = this.checked ? "block" : "none";
    document.getElementById("textoAlergia").innerText = this.checked ? "Sí" : "No";
});

// 6. ENVÍO DEL FORMULARIO
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
        ninos: esCancelado ? 0 : (document.getElementById("ninos").value || 0),
        alergias: esCancelado ? "Ninguna" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(formData) });
        
        const mensaje = document.getElementById("mensajeExito");
        mensaje.innerHTML = `
            <div style="background:white; padding:30px; border-radius:15px; text-align:center; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h2 style="color:${esCancelado ? '#ba1a1a' : '#d4af37'}">${esCancelado ? 'Invitación Cancelada' : '¡Confirmado!'}</h2>
                <p>Tu respuesta ha sido registrada correctamente.</p>
            </div>`;
        mensaje.classList.add("show");
        
        setTimeout(() => location.reload(), 3000);
    } catch (e) {
        alert("Hubo un error al enviar. Por favor intenta de nuevo.");
        btn.disabled = false;
        btn.innerText = "Intentar de nuevo";
    }
});