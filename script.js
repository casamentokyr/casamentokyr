// 1. CONFIGURACIÓN
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 15, 2027 16:00:00").getTime();

// 2. CUENTA REGRESIVA
function updateCountdown() {
    const now = new Date().getTime();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
        document.getElementById("days").innerText = 0;
        document.getElementById("hours").innerText = 0;
        document.getElementById("minutes").innerText = 0;
        document.getElementById("seconds").innerText = 0;
        return;
    }

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
            music.play().catch(e => console.log("Error al reproducir:", e));
            musicImg.src = "pause.png";
        } else {
            music.pause();
            musicImg.src = "play.png";
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
            // Rellenar campos ocultos y nombre
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

            // --- LÓGICA DINÁMICA DE NIÑOS ---
            const divNinos = document.getElementById("seccionNinos"); 
            const contenedorNinos = document.getElementById("seccionNinos"); // Usamos el ID de tu HTML

            function gestionarNinos(mostrar) {
                // Si no hay niños permitidos en Excel o se decide ocultar, vaciamos el div
                if (!mostrar || parseInt(data.ninosPermitidos) === 0 || parseInt(data.ninos) === 0) {
                    contenedorNinos.innerHTML = "";
                    contenedorNinos.style.display = "none";
                    return;
                }

                // Si hay niños, construimos el selector dentro del div
                contenedorNinos.style.display = "block";
                contenedorNinos.innerHTML = `
                    <label style="font-weight:bold; color:#d4af37; margin-bottom:10px; display:block;">Niños invitados</label>
                    <select id="ninos" class="input-estilo">
                        <option value="0">Ningún niño asiste</option>
                    </select>
                `;

                const selectN = document.getElementById("ninos");
                for (let j = 1; j <= data.ninos; j++) {
                    let opt = document.createElement("option");
                    opt.value = j;
                    opt.text = `${j} Niño${j > 1 ? 's' : ''} confirmado${j > 1 ? 's' : ''}`;
                    selectN.appendChild(opt);
                }
            }

            // Inicializar sección niños según el Excel
            gestionarNinos(true);

            // --- EVENTO AL CAMBIAR ADULTOS (CANCELAR / ASISTIR) ---
            selectA.addEventListener("change", function() {
                const contenedorExtra = document.getElementById("contenedorExtra");
                const btn = document.getElementById("btnSubmit");

                if (this.value === "0") {
                    gestionarNinos(false); // Borra sección niños
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Confirmar Cancelación";
                    btn.style.background = "#ba1a1a"; // Rojo
                } else {
                    gestionarNinos(true); // Muestra sección niños si aplica
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.background = "#d4af37"; // Dorado original
                }
            });

            // Si ya confirmó en el pasado
            if (data.confirmado === "SI") {
                document.getElementById("mensajeConfirmado").style.display = "block";
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                document.getElementById("btnSubmit").innerText = "Asistencia ya confirmada";
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

// 6. ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const adultosVal = document.getElementById("adultos").value;
    const esCancelado = adultosVal === "0";
    const selectNinos = document.getElementById("ninos");
    
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: adultosVal,
        ninos: esCancelado ? 0 : (selectNinos ? selectNinos.value : 0),
        alergias: esCancelado ? "Ninguna" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(formData)
        });

        const mensaje = document.getElementById("mensajeExito");
        mensaje.innerHTML = `
            <div style="background:white; padding:40px; border-radius:15px; text-align:center; box-shadow:0 0 20px rgba(0,0,0,0.2);">
                <h2 style="color:${esCancelado ? '#ba1a1a' : '#d4af37'};">${esCancelado ? 'Cancelación Enviada' : '¡Confirmado!'}</h2>
                <p>Tu respuesta ha sido registrada. ¡Gracias!</p>
            </div>`;
        mensaje.classList.add("show");

        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar. Intenta de nuevo.");
        btn.disabled = false;
        btn.innerText = "Confirmar";
    }
});