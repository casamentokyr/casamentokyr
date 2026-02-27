// 1. CONFIGURACION INICIO
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";
const WEDDING_DATE = new Date("May 22, 2027 11:00:00").getTime();

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

// 4. CARGA DE DATOS Y LOGICA PARA QUE SE BLOQUEE
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");
    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            const rsvpForm = document.getElementById("rsvpForm");
            const selectA = document.getElementById("adultos");
            const divNinos = document.getElementById("seccionNinos") || document.getElementById("contenedorNinosDinamico");
            const contenedorExtra = document.getElementById("contenedorExtra");
            const btn = document.getElementById("btnSubmit");

            // ---  BLOQUEO SI YA EXISTE RESPUESTA ---
            if (data.confirmado === "SI" || data.confirmado === "CANCELADO") {
                const esConfirmada = data.confirmado === "SI";
                
                // OcultO FORMULARIO
                rsvpForm.style.display = "none";
                
                // Creamos un aviso elegante
                const aviso = document.createElement("div");
                aviso.style.padding = "40px 20px";
                aviso.style.background = "#fff";
                aviso.style.borderRadius = "15px";
                aviso.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                aviso.style.margin = "20px auto";
                aviso.style.maxWidth = "500px";

                aviso.innerHTML = `
                    <h2 style="color: ${esConfirmada ? '#d4af37' : '#ba1a1a'}; margin-bottom: 15px;">
                        ${esConfirmada ? '¡O teu convite foi confirmado!' : 'O teu convite foi cancelado'}
                    </h2>
                    <p style="color: #666; font-size: 1.1em; line-height: 1.6;">
                        Qualquer alteração, por favor contacta diretamente os noivos.
                    </p>
                    <div style="margin-top: 20px; font-size: 2em;">${esConfirmada ? '🥂' : '✉️'}</div>
                `;
                
                rsvpForm.parentNode.insertBefore(aviso, rsvpForm);
                return; 
            }

            // --- SI NO HA CONFIRMADO, SE CARGA EL FORMULARIO NORMAL ---
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // Rellenar Adultos
            selectA.innerHTML = '<option value="" disabled selected>Seleciona a quantidade...</option>';
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

            // Niños (Carga inicial)
            if (parseInt(data.ninos) > 0) {
                divNinos.style.display = "block";
                divNinos.innerHTML = `
                    <label style="font-weight:bold; color:#d4af37; margin-bottom:10px; display:block;">Crianças Convidadas</label>
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
            }

            selectA.addEventListener("change", function() {
                if (this.value === "0") {
                    divNinos.style.display = "none";
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar Convite";
                    btn.style.backgroundColor = "#ba1a1a"; 
                } else {
                    if (parseInt(data.ninos) > 0) divNinos.style.display = "block";
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar Presença";
                    btn.style.backgroundColor = "#d4af37";
                }
            });
        });
});

// SWITCH ALERGIAS
document.getElementById("switchAlergia").addEventListener("change", function() {
    document.getElementById("campoAlergiaTexto").style.display = this.checked ? "block" : "none";
    document.getElementById("textoAlergia").innerText = this.checked ? "Sim" : "Não";
});

// ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
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
        alergias: esCancelado ? "No" : (document.getElementById("switchAlergia").checked ? document.getElementById("alergias").value : "No"),
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelado ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(formData) });
        
        // Mensaje de éxito 
        document.getElementById("mensajeExito").innerHTML = `
            <div style="background:white; padding:40px; border-radius:15px; text-align:center;">
                <h2 style="color:${esCancelado ? '#ba1a1a' : '#d4af37'}">¡Enviado!</h2>
                <p>A atualizar o estado do convite...</p>
            </div>`;
        document.getElementById("mensajeExito").classList.add("show");
        
        // Recargar página para que entre en el modo BLOQUEDO 
        setTimeout(() => {
            location.reload();
        }, 2500);

    } catch (err) {
        alert("Erro ao enviar. Tente novamente.");
        btn.disabled = false;
        btn.innerText = "Confirmar Presença";
    }
});