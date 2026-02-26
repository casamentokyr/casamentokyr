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
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            const selectA = document.getElementById("adultos");
            const divNinos = document.getElementById("seccionNinos") || document.getElementById("contenedorNinosDinamico");
            const contenedorExtra = document.getElementById("contenedorExtra");
            const btn = document.getElementById("btnSubmit");

            // Rellenar selector de Adultos
            selectA.innerHTML = '<option value="" disabled selected>Selecciona cantidad...</option>';
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = `${i} Adulto${i > 1 ? 's' : ''}`;
                selectA.appendChild(opt);
            }
            let optCancel = document.createElement("option");
            optCancel.value = "0";
            optCancel.text = "No podré asistir (Cancelar)";
            selectA.appendChild(optCancel);

            // FUNCIÓN PARA GENERAR NIÑOS (Se llama desde el inicio)
            function mostrarNinosSiExisten() {
                if (parseInt(data.ninos) > 0) {
                    divNinos.style.display = "block";
                    divNinos.innerHTML = `
                        <label style="font-weight:bold; color:#d4af37; margin-bottom:10px; display:block;">Niños invitados</label>
                        <select id="ninos" class="input-estilo">
                            <option value="0">No asistirán niños</option>
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
                    divNinos.style.display = "none";
                    divNinos.innerHTML = '<input type="hidden" id="ninos" value="0">';
                }
            }

            // LLAMADA INICIAL: Mostrar niños apenas carguen los datos
            mostrarNinosSiExisten();

            // Lógica cuando el usuario cambia la selección de adultos
            selectA.addEventListener("change", function() {
                if (this.value === "0") {
                    // SI CANCELA
                    divNinos.style.display = "none";
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar Invitación";
                    btn.style.backgroundColor = "#ba1a1a"; // Rojo
                    btn.style.color = "white";
                } else {
                    // SI ASISTE
                    if (parseInt(data.ninos) > 0) divNinos.style.display = "block";
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Asistencia";
                    btn.style.backgroundColor = "#d4af37"; // Dorado
                    btn.style.color = "white";
                }
            });

            if (data.confirmado === "SI") {
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                btn.innerText = "Invitación ya confirmada";
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
    const adultosVal = document.getElementById("adultos").value;
    const esCancelado = adultosVal === "0";
    const ninosVal = document.getElementById("ninos") ? document.getElementById("ninos").value : 0;
    
    btn.disabled = true;
    btn.innerText = "Enviando...";

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: adultosVal,
        ninos: esCancelado ? 0 : ninosVal,
        alergias: esCancelado ? "No" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "No"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(formData) });
        document.getElementById("mensajeExito").innerHTML = `
            <div style="background:white; padding:40px; border-radius:15px; text-align:center; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <h2 style="color:${esCancelado ? '#ba1a1a' : '#d4af37'}">${esCancelado ? 'Cancelado' : '¡Confirmado!'}</h2>
                <p>Tu respuesta ha sido enviada con éxito.</p>
            </div>`;
        document.getElementById("mensajeExito").classList.add("show");
        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar");
        btn.disabled = false;
        btn.innerText = "Confirmar Asistencia";
    }
});