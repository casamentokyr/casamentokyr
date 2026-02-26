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
            music.play().catch(e => console.log("Error:", e));
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
            // Llenar datos básicos
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // --- SELECTOR DE ADULTOS ---
            const selectA = document.getElementById("adultos");
            selectA.innerHTML = '<option value="" disabled selected>¿Cuántos adultos asisten?</option>';
            
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = `${i} Adulto${i > 1 ? 's' : ''}`;
                selectA.appendChild(opt);
            }
            
            let optCancel = document.createElement("option");
            optCancel.value = "0";
            optCancel.text = "No podré asistir (Cancelar invitación)";
            selectA.appendChild(optCancel);

            const seccionNinos = document.getElementById("seccionNinos");
            const contenedorExtra = document.getElementById("contenedorExtra");
            const btn = document.getElementById("btnSubmit");

            // --- ESCUCHADOR DE CAMBIOS ---
            selectA.addEventListener("change", function() {
                const valorSeleccionado = this.value;

                if (valorSeleccionado === "0") {
                    // MODO CANCELAR
                    seccionNinos.style.display = "none";
                    seccionNinos.innerHTML = ""; // Limpiamos para evitar IDs duplicados
                    contenedorExtra.style.display = "none";
                    
                    // Ajuste del botón
                    btn.innerText = "Cancelar Invitación";
                    btn.style.backgroundColor = "#ba1a1a"; // Rojo fuerte
                    btn.style.color = "white";
                } else {
                    // MODO ASISTIR
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.backgroundColor = "#d4af37"; // Dorado
                    btn.style.color = "white";

                    // REVISAR SI HAY NIÑOS EN EL EXCEL
                    if (parseInt(data.ninosPermitidos) > 0 && parseInt(data.ninos) > 0) {
                        seccionNinos.style.display = "block";
                        seccionNinos.innerHTML = `
                            <label style="font-weight:bold; color:#d4af37; margin-bottom:10px; display:block;">¿Cuántos niños asisten?</label>
                            <select id="ninos" class="input-estilo" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                                <option value="0">0 Niños</option>
                            </select>
                        `;
                        const selectN = document.getElementById("ninos");
                        for (let j = 1; j <= data.ninos; j++) {
                            let opt = document.createElement("option");
                            opt.value = j;
                            opt.text = `${j} Niño${j > 1 ? 's' : ''}`;
                            selectN.appendChild(opt);
                        }
                    } else {
                        seccionNinos.style.display = "none";
                        seccionNinos.innerHTML = '<input type="hidden" id="ninos" value="0">';
                    }
                }
            });

            // Si ya confirmó antes
            if (data.confirmado === "SI") {
                document.getElementById("mensajeConfirmado").style.display = "block";
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                btn.innerText = "Invitación ya confirmada";
            }
        });
});

// 5. SWITCH ALERGIAS
document.getElementById("switchAlergia").addEventListener("change", function() {
    const campoAlergia = document.getElementById("campoAlergiaTexto");
    const textoAlergia = document.getElementById("textoAlergia");
    if(this.checked) {
        campoAlergia.style.display = "block";
        textoAlergia.innerText = "Sí";
    } else {
        campoAlergia.style.display = "none";
        textoAlergia.innerText = "No";
    }
});

// 6. ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const adultosVal = document.getElementById("adultos").value;
    const ninosInput = document.getElementById("ninos");
    const esCancelado = adultosVal === "0";
    
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: adultosVal,
        ninos: esCancelado ? 0 : (ninosInput ? ninosInput.value : 0),
        alergias: esCancelado ? "Ninguna" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "Ninguna"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(formData) });
        
        document.getElementById("mensajeExito").innerHTML = `
            <div style="background:white; padding:40px; border-radius:15px; text-align:center; box-shadow: 0 5px 20px rgba(0,0,0,0.2);">
                <h2 style="color:${esCancelado ? '#ba1a1a' : '#d4af37'}">${esCancelado ? 'Cancelado' : '¡Confirmado!'}</h2>
                <p>Tu respuesta ha sido guardada.</p>
            </div>`;
        document.getElementById("mensajeExito").classList.add("show");
        
        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar. Inténtalo de nuevo.");
        btn.disabled = false;
        btn.innerText = "Reintentar";
    }
});
