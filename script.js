const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyjuQb6qBEXoQCYkWSL94r87hFRcO2RIdCRpad7PRPBHrJRGixBOinmcJJN0HfvmrgF7A/exec";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo") || params.get("guest");

    if (!codigo) return;

    fetch(`${SCRIPT_URL}?codigo=${codigo}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("codigo").value = codigo;
            document.getElementById("nombre").value = data.nombre || "Invitado";
            
            // 1. GENERAR OPCIONES DE ADULTOS + CANCELAR
            const adultosSelect = document.getElementById("adultos");
            adultosSelect.innerHTML = ""; // Limpiar
            
            for (let i = 1; i <= data.adultos; i++) {
                let opt = document.createElement("option");
                opt.value = i;
                opt.text = i + (i === 1 ? " Adulto" : " Adultos");
                adultosSelect.appendChild(opt);
            }
            
            // Opción de Cancelar
            let optCancelar = document.createElement("option");
            optCancelar.value = "0";
            optCancelar.text = "No podré asistir (Cancelar)";
            adultosSelect.appendChild(optCancelar);

            // 2. LÓGICA DE NIÑOS
            const seccionNinos = document.getElementById("seccionNinos");
            const textoNinos = document.getElementById("textoNinos");
            const ninosInput = document.getElementById("ninos");

            if (parseInt(data.ninosPermitidos) > 0 && parseInt(data.ninos) > 0) {
                seccionNinos.style.display = "block";
                textoNinos.innerText = `Niños invitados: ${data.ninos}`;
                ninosInput.max = data.ninos;
                ninosInput.value = data.ninos;
            }

            // 3. EVENTO AL CAMBIAR EL SELECTOR DE ADULTOS
            adultosSelect.addEventListener("change", function() {
                const contenedorExtra = document.getElementById("contenedorExtra");
                const btn = document.getElementById("btnSubmit");

                if (this.value === "0") {
                    // SI CANCELA: Ocultamos Niños y Alergias
                    seccionNinos.style.display = "none";
                    contenedorExtra.style.display = "none";
                    btn.innerText = "Cancelar invitación";
                    btn.style.background = "#888"; // Color neutro para cancelar
                } else {
                    // SI ASISTE: Mostramos todo de nuevo (si corresponde)
                    if (parseInt(data.ninosPermitidos) > 0) seccionNinos.style.display = "block";
                    contenedorExtra.style.display = "block";
                    btn.innerText = "Confirmar asistencia";
                    btn.style.background = "#d4af37"; // Color boda
                }
            });

            // Si ya confirmó previamente
            if (data.confirmado === "SI") {
                document.getElementById("rsvpForm").style.opacity = "0.5";
                document.getElementById("rsvpForm").style.pointerEvents = "none";
                document.getElementById("btnSubmit").innerText = "Ya confirmaste";
            }
        });
});

// LOGICA SWITCH ALERGIAS
document.getElementById("switchAlergia").addEventListener("change", function() {
    document.getElementById("campoAlergiaTexto").style.display = this.checked ? "block" : "none";
    document.getElementById("textoAlergia").innerText = this.checked ? "Sí" : "No";
});

// ENVÍO DEL FORMULARIO
document.getElementById("rsvpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const esCancelacion = document.getElementById("adultos").value === "0";
    
    btn.innerText = "Enviando...";
    btn.disabled = true;

    const formData = {
        codigo: document.getElementById("codigo").value,
        nombre: document.getElementById("nombre").value,
        adultos: document.getElementById("adultos").value,
        // Si cancela, mandamos 0 niños y sin alergias
        ninos: esCancelacion ? 0 : document.getElementById("ninos").value,
        alergias: (!esCancelacion && document.getElementById("switchAlergia").checked) ? document.getElementById("alergias").value : "Ninguna",
        comentarios: document.getElementById("comentarios").value,
        confirmacion: esCancelacion ? "CANCELADO" : "CONFIRMADO"
    };

    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(formData)
        });

        const mensaje = document.getElementById("mensajeExito");
        mensaje.innerHTML = `<div style="background:white; padding:40px; border-radius:15px; text-align:center;">
            <h2>${esCancelacion ? 'Entendido' : '¡Gracias!'}</h2>
            <p>${esCancelacion ? 'Hemos registrado que no podrás asistir.' : 'Tu asistencia ha sido confirmada.'}</p>
        </div>`;
        mensaje.classList.add("show");
        setTimeout(() => location.reload(), 3000);
    } catch (err) {
        alert("Error al enviar");
        btn.disabled = false;
    }
});