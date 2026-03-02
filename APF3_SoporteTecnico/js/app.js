"use strict";


/* 1. VARIABLES, CONSTANTES Y TIPOS DE DATOS*/

const WHATSAPP_NUMBER  = "51937144754";             
const STORAGE_KEY      = "reserva_TecHogarSupport"; 
const LARAVEL_URL      = "http://localhost:8000/solicitud"; 
const PRECIO_MINIMO    = 40;                        
const APP_ACTIVO       = true;                      

let totalSolicitudes   = 0;   
let menuAbierto        = false; 
let ultimoDistrito     = "";   

// Arreglo de servicios disponibles
const servicios = [
  { nombre: "Mantenimiento preventivo",             precio: 60  },
  { nombre: "Formateo + instalación",               precio: 120 },
  { nombre: "Redes y Wi-Fi",                        precio: 80  },
  { nombre: "Soporte remoto",                       precio: 40  },
  { nombre: "Seguridad básica (antivirus/malware)", precio: 70  },
  { nombre: "Optimización de rendimiento",          precio: 50  },
];

// Recorrer arreglo en consola con bucle for
console.log("=== Servicios TecHogar Support Perú ===");
for (let i = 0; i < servicios.length; i++) {
  console.log(`${i + 1}. ${servicios[i].nombre} — Desde S/ ${servicios[i].precio}`);
}

// Bucle while
let wi = 0, contadorServicios = 0;
while (wi < servicios.length) {
  if (servicios[wi].precio >= PRECIO_MINIMO) contadorServicios++;
  wi++;
}
console.log(`Servicios con precio >= S/${PRECIO_MINIMO}: ${contadorServicios}`);

/* 2. HELPERS*/

function buildWhatsAppLink(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function setBtnLoading(btn, state) {
  if (!btn) return;
  btn.disabled  = state;
  btn.innerHTML = state
    ? `<i class="fa-solid fa-spinner fa-spin"></i> Enviando...`
    : `<i class="fa-solid fa-paper-plane"></i> Enviar solicitud`;
}

function isValidPhone(phone) {
  return /^\d{9}$/.test(phone);
}

// Clasifica el servicio usando if / else if / else
function clasificarServicio(precio) {
  if (precio < 60) {
    return "Económico";
  } else if (precio >= 60 && precio < 100) {
    return "Estándar";
  } else {
    return "Premium";
  }
}

/* 3. ENVÍO A LARAVEL  */

async function enviarALaravel(reserva) {
  try {
    const body = new URLSearchParams({
      nombre:   reserva.nombre_completo,
      correo:   reserva.correo   || "",
      celular:  reserva.celular,
      distrito: reserva.distrito,
      fecha:    reserva.fecha_preferida,
      hora:     reserva.hora_preferida,
      tipo:     reserva.tipo_atencion,
      servicio: reserva.servicio,
      mensaje:  reserva.mensaje  || "",
    });
    const res = await fetch(LARAVEL_URL, {
      method:  "POST",
      headers: {
        "Content-Type":     "application/x-www-form-urlencoded",
        "Accept":           "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: body.toString(),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("Laravel guardó la solicitud. ID:", data.id);
    } else {
      console.warn("Laravel respondió con error:", res.status);
    }
  } catch (err) {
    console.warn("No se pudo conectar con Laravel (el flujo HTML continúa):", err.message);
  }
}

/* 4. MENÚ RESPONSIVO */

function initMenu() {
  const btnHamburguesa = document.getElementById("btnHamburguesa");
  const navMenu        = document.getElementById("navMenu");
  if (!btnHamburguesa || !navMenu) return;

  // onclick en botón hamburguesa
  btnHamburguesa.addEventListener("click", () => {
    navMenu.classList.toggle("nav--open");          
    menuAbierto = !menuAbierto;
    btnHamburguesa.setAttribute("aria-expanded", menuAbierto); 
    const icono = btnHamburguesa.querySelector("i");
    if (icono) {
      icono.className = menuAbierto ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    }
    console.log("Menú:", menuAbierto ? "abierto" : "cerrado");
  });

  // Cerrar al hacer clic en un enlace
  navMenu.querySelectorAll("a").forEach(enlace => {  
    enlace.addEventListener("click", () => {
      navMenu.classList.remove("nav--open");          
      menuAbierto = false;
      btnHamburguesa.setAttribute("aria-expanded", false);
      const icono = btnHamburguesa.querySelector("i");
      if (icono) icono.className = "fa-solid fa-bars";
    });
  });
}

/* 5. MODAL */

function initModal() {
  const btnAbrirModal  = document.getElementById("btnAbrirModal");
  const modal          = document.getElementById("modalInfo");
  const btnCerrarModal = document.getElementById("btnCerrarModal");
  if (!modal) return;

  function abrirModal() {
    modal.classList.add("modal--visible");         
    document.body.style.overflow = "hidden";       
    console.log("Modal abierto");
  }

  function cerrarModal() {
    modal.classList.remove("modal--visible");      
    document.body.style.overflow = "";
    console.log("Modal cerrado");
  }

  if (btnAbrirModal) btnAbrirModal.addEventListener("click", abrirModal);
  if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModal);

  // Cerrar clic en fondo oscuro
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
}

/* 6. HOVER EN TARJETAS (onmouseover / onmouseout)*/

function initHoverTarjetas() {
  const tarjetas = document.querySelectorAll(".card");
  tarjetas.forEach((card, i) => {
    card.addEventListener("mouseover", () => {    
      card.style.borderColor = "rgba(124,92,255,0.8)";
      console.log("Hover en:", servicios[i]?.nombre || "tarjeta");
    });
    card.addEventListener("mouseout", () => {      
      card.style.borderColor = "";
    });
  });
}

/* 7. onchange EN SELECT DISTRITO*/

function initCambioDistrito() {
  const selectDistrito = document.querySelector('select[name="distrito"]');
  const infoZona       = document.getElementById("infoZona");
  if (!selectDistrito || !infoZona) return;

  const cobertura = [
    { distritos: ["San Juan de Lurigancho","Ate","Santa Anita"],             dia: "Lunes"     },
    { distritos: ["Los Olivos","San Martín de Porres","Comas"],              dia: "Martes"    },
    { distritos: ["Miraflores","Surco","San Borja","La Molina",
                  "San Isidro","Barranco"],                                   dia: "Miércoles" },
    { distritos: ["Breña","Jesús María","Lince"],                            dia: "Jueves"    },
    { distritos: ["Cercado de Lima","La Victoria","San Miguel",
                  "Pueblo Libre","Magdalena"],                                dia: "Viernes"   },
  ];

  selectDistrito.addEventListener("change", () => {   // onchange
    const valor = selectDistrito.value;
    ultimoDistrito = valor;
    let diaEncontrado = "Según disponibilidad";
    for (const zona of cobertura) {
      if (zona.distritos.includes(valor)) { diaEncontrado = zona.dia; break; }
    }
    infoZona.textContent = `📅 Cobertura en ${valor}: ${diaEncontrado}`;  // .textContent
    infoZona.style.display = "block";
    console.log(`Distrito: ${valor} → ${diaEncontrado}`);
  });
}

/* 8. CONTADOR DOM  */

function actualizarContadorDOM() {
  let contador = document.getElementById("contadorSolicitudes");
  if (!contador) {
    contador = document.createElement("p");         
    contador.id = "contadorSolicitudes";
    contador.style.cssText =
      "margin-top:8px;color:var(--accent);font-weight:700;font-size:0.9rem;";
    const formActions = document.querySelector(".form-actions");
    if (formActions) formActions.appendChild(contador); 
  }
  contador.innerText = totalSolicitudes === 0        
    ? ""
    : `Solicitudes enviadas esta sesión: ${totalSolicitudes}`;
}

/* 9. FORMULARIO PRINCIPAL */

document.addEventListener("DOMContentLoaded", () => {

  initMenu();
  initModal();
  initHoverTarjetas();
  initCambioDistrito();
  actualizarContadorDOM();

  const form = document.getElementById("reservaForm") || document.querySelector("form.form");
  const btn  = document.getElementById("btnReservar") ||
               (form ? form.querySelector('button[type="submit"]') : null);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setBtnLoading(btn, true);

    const fd = new FormData(form);
    const reserva = {
      estado:          "Pendiente de confirmación",
      nombre_completo: (fd.get("nombre")   || "").trim(),
      correo:          (fd.get("correo")   || "").trim(),
      celular:         (fd.get("celular")  || "").replace(/\D/g, ""),
      distrito:        (fd.get("distrito") || "").trim(),
      fecha_preferida: (fd.get("fecha")    || "").trim(),
      hora_preferida:  (fd.get("hora")     || "").trim(),
      tipo_atencion:   (fd.get("tipo")     || "").trim(),
      servicio:        (fd.get("servicio") || "").trim(),
      mensaje:         (fd.get("mensaje")  || "").trim(),
    };

    // Validar campos obligatorios
    if (!reserva.nombre_completo || !reserva.celular || !reserva.distrito ||
        !reserva.fecha_preferida || !reserva.hora_preferida ||
        !reserva.servicio || !reserva.tipo_atencion) {
      alert("Por favor, completa todos los campos obligatorios.");  // alert()
      setBtnLoading(btn, false);
      return;
    }

    if (!isValidPhone(reserva.celular)) {
      alert(" Ingresa un número de celular válido (9 dígitos, sin espacios)."); // alert()
      setBtnLoading(btn, false);
      return;
    }

    // confirm() antes de enviar
    const ok = confirm(
      `¿Confirmas tu solicitud?\n\n` +
      `Nombre: ${reserva.nombre_completo}\n` +
      `Servicio: ${reserva.servicio}\n` +
      `Fecha: ${reserva.fecha_preferida}  Hora: ${reserva.hora_preferida}`
    );
    if (!ok) { setBtnLoading(btn, false); return; }

    // Clasificar servicio
    const srv = servicios.find(s => s.nombre === reserva.servicio);
    if (srv) {
      console.log(`Categoría del servicio: ${clasificarServicio(srv.precio)}`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reserva));
    totalSolicitudes++;
    actualizarContadorDOM();
    enviarALaravel(reserva);

    setTimeout(() => {
      const base = window.location.href.replace(/\/[^\/]*$/, "/");
      window.location.href = base + "Registro.html";
    }, 600);
  });

  // prompt() al cargar por primera vez en la sesión
  if (!sessionStorage.getItem("yaVisito")) {
    const nombreVisita = prompt(" Bienvenido a TecHogar Support Perú.\n¿Cómo te llamas? (opcional)"); // prompt()
    sessionStorage.setItem("yaVisito", "true");
    if (nombreVisita && nombreVisita.trim() !== "") {
      const brandP = document.querySelector(".brand p"); 
      if (brandP) {
        brandP.innerHTML =
          `Hola, <strong>${nombreVisita.trim()}</strong> ¿En qué podemos ayudarte hoy?`;  
      }
      console.log("Visitante:", nombreVisita.trim());
    }
  }

});

/* 10. REGISTRO.HTML */

(function initRegistro() {
  const path = window.location.pathname.toLowerCase();
  if (!path.includes("registro.html")) return;

  let reserva = null;
  try { reserva = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { reserva = null; }

  if (!reserva) {
    alert("No se encontró información de reserva. Serás redirigido al inicio.");
    window.location.href = "Servicio.html";
    return;
  }

  let fechaPeru = reserva.fecha_preferida;
  try {
    fechaPeru = new Date(reserva.fecha_preferida + "T00:00:00")
      .toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {}

  // getElementById() + innerHTML
  const ul = document.getElementById("detalleReserva");
  if (ul) {
    ul.innerHTML = `
      <li><span class="detail-label">Estado:</span>   <span class="detail-value estado">${reserva.estado}</span></li>
      <li><span class="detail-label">Cliente:</span>  <span class="detail-value">${reserva.nombre_completo}</span></li>
      <li><span class="detail-label">Celular:</span>  <span class="detail-value">${reserva.celular}</span></li>
      ${reserva.correo ? `<li><span class="detail-label">Correo:</span><span class="detail-value">${reserva.correo}</span></li>` : ""}
      <li><span class="detail-label">Distrito:</span> <span class="detail-value">${reserva.distrito}</span></li>
      <li><span class="detail-label">Fecha:</span>    <span class="detail-value">${fechaPeru}</span></li>
      <li><span class="detail-label">Hora:</span>     <span class="detail-value">${reserva.hora_preferida}</span></li>
      ${reserva.tipo_atencion ? `<li><span class="detail-label">Tipo:</span><span class="detail-value">${reserva.tipo_atencion}</span></li>` : ""}
      <li><span class="detail-label">Servicio:</span> <span class="detail-value">${reserva.servicio}</span></li>
      ${reserva.mensaje ? `<li><span class="detail-label">Mensaje:</span><span class="detail-value">${reserva.mensaje}</span></li>` : ""}
    `;
  }

  const btnWhatsapp = document.getElementById("btnWhatsapp");
  if (btnWhatsapp) {
    const text =
`Hola TecHogar Support Perú 
Quiero confirmar mi reserva:

Estado:   ${reserva.estado}
Cliente:  ${reserva.nombre_completo}
Celular:  ${reserva.celular}
Distrito: ${reserva.distrito}
Fecha:    ${fechaPeru}
Hora:     ${reserva.hora_preferida}
Servicio: ${reserva.servicio}
${reserva.tipo_atencion ? `Tipo:     ${reserva.tipo_atencion}\n` : ""}
${reserva.mensaje        ? `Mensaje:  ${reserva.mensaje}`        : ""}`;
    btnWhatsapp.href   = buildWhatsAppLink(WHATSAPP_NUMBER, text);
    btnWhatsapp.target = "_blank";
    btnWhatsapp.rel    = "noopener";
  }

  // Botón "Nueva solicitud" con confirm() y .remove()
  const btnNueva       = document.getElementById("btnNuevaSolicitud");
  const msgConfirmacion = document.getElementById("msgConfirmacion");
  if (btnNueva && msgConfirmacion) {
    btnNueva.addEventListener("click", () => {
      const volver = confirm("¿Deseas hacer una nueva solicitud?");   
      if (volver) {
        msgConfirmacion.remove();                                     
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "Servicio.html";
      }
    });
  }
})();
