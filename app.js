const PRODUCTOS = {
    "1": {
        "id": 1,
        "nombre": "Categoría Baja",
        "precio": 30000,
        "url": "producto-1.html"
    },
    "2": {
        "id": 2,
        "nombre": "Categoría Media",
        "precio": 200000,
        "url": "producto-2.html"
    },
    "3": {
        "id": 3,
        "nombre": "Categoría Alta",
        "precio": 180000,
        "url": "producto-3.html"
    },
    "4": {
        "id": 4,
        "nombre": "Categoría Premium",
        "precio": 350000,
        "url": "producto-4.html"
    }
};

/* =========================================================
   FAWEB · JavaScript compartido por todas las páginas
   - Carrito persistente (localStorage) entre páginas
   - Menú móvil (hamburguesa)
   - Botones "Agregar", selector de cantidad, formulario de contacto
   Para cambiar nombres/precios, edita el objeto PRODUCTOS de arriba.
========================================================= */
(function () {
    "use strict";

    var CLAVE = "faweb_carrito";
    var WHATSAPP = "573000000000"; // <- cambia por tu número real (código de país + número)

    /* ---------- Almacenamiento ---------- */
    function leer() {
        try {
            var datos = JSON.parse(localStorage.getItem(CLAVE) || "[]");
            return Array.isArray(datos) ? datos.filter(function (i) { return PRODUCTOS[i.id]; }) : [];
        } catch (e) { return []; }
    }
    function guardar(c) {
        try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) { /* modo privado */ }
    }
    var carrito = leer();

    function formato(n) { return n.toLocaleString("es-CO"); }
    function totalUnidades() { return carrito.reduce(function (s, i) { return s + i.cantidad; }, 0); }

    /* ---------- Contador y aviso ---------- */
    function actualizarContador() {
        var el = document.getElementById("contador");
        if (el) el.textContent = totalUnidades();
    }

    var toastTimer;
    function aviso(texto) {
        var t = document.getElementById("toast");
        if (!t) return;
        t.textContent = texto;
        t.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
    }

    /* ---------- Operaciones del carrito ---------- */
    function agregar(id, cantidad) {
        cantidad = Math.max(1, Math.min(20, parseInt(cantidad, 10) || 1));
        var item = carrito.find(function (i) { return i.id === id; });
        if (item) item.cantidad += cantidad; else carrito.push({ id: id, cantidad: cantidad });
        guardar(carrito);
        actualizarContador();
        renderCarrito();
        aviso(PRODUCTOS[id].nombre + " agregada al carrito ✓");
    }
    function cambiarCantidad(id, delta) {
        var item = carrito.find(function (i) { return i.id === id; });
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) carrito = carrito.filter(function (i) { return i.id !== id; });
        guardar(carrito); actualizarContador(); renderCarrito();
    }
    function eliminar(id) {
        carrito = carrito.filter(function (i) { return i.id !== id; });
        guardar(carrito); actualizarContador(); renderCarrito();
    }
    function vaciar() {
        carrito = [];
        guardar(carrito); actualizarContador(); renderCarrito();
    }

    /* ---------- Render de la página del carrito ---------- */
    function renderCarrito() {
        var lista = document.getElementById("lista-carrito");
        if (!lista) return; // no estamos en carrito.html
        var mensaje = document.getElementById("mensaje-carrito");
        var totalDiv = document.getElementById("total-carrito");
        var totalValor = document.getElementById("total-valor");
        var btnFin = document.getElementById("btn-finalizar");
        var btnVaciar = document.getElementById("btn-vaciar");

        lista.innerHTML = "";

        if (carrito.length === 0) {
            mensaje.textContent = "Todavía no has agregado ninguna categoría.";
            totalDiv.style.display = "none";
            btnFin.style.display = "none";
            btnVaciar.style.display = "none";
            return;
        }

        mensaje.textContent = "Has seleccionado " + totalUnidades() + " producto(s).";
        var total = 0;

        carrito.forEach(function (it) {
            var p = PRODUCTOS[it.id];
            var sub = p.precio * it.cantidad;
            total += sub;
            var fila = document.createElement("div");
            fila.className = "cart-item";
            fila.innerHTML =
                '<div class="item-info"><strong><a href="' + p.url + '">' + p.nombre + '</a></strong>' +
                '<small>$' + formato(p.precio) + ' c/u</small></div>' +
                '<div class="item-controls">' +
                '<button type="button" class="qty-btn" data-menos="' + p.id + '" aria-label="Quitar uno">−</button>' +
                '<span class="qty-num">' + it.cantidad + '</span>' +
                '<button type="button" class="qty-btn" data-mas="' + p.id + '" aria-label="Agregar uno">+</button></div>' +
                '<span class="item-subtotal">$' + formato(sub) + '</span>' +
                '<button type="button" data-quitar="' + p.id + '" title="Eliminar" aria-label="Eliminar">✕</button>';
            lista.appendChild(fila);
        });

        totalDiv.style.display = "block";
        totalValor.textContent = formato(total);
        btnFin.style.display = "";
        btnVaciar.style.display = "";
    }

    function finalizarPedido() {
        var total = 0;
        var lineas = carrito.map(function (it) {
            var p = PRODUCTOS[it.id];
            total += p.precio * it.cantidad;
            return "• " + it.cantidad + " x " + p.nombre + " ($" + formato(p.precio * it.cantidad) + ")";
        });
        var texto = "Hola Faweb, quiero hacer este pedido:\n" + lineas.join("\n") + "\nTotal: $" + formato(total);
        window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    }

    /* ---------- Eventos globales (delegación) ---------- */
    document.addEventListener("click", function (e) {
        var t = e.target.closest("button, a");
        if (!t) return;

        if (t.hasAttribute("data-add")) {
            var qtySel = t.getAttribute("data-qty-from");
            var qtyEl = qtySel ? document.querySelector(qtySel) : null;
            agregar(parseInt(t.getAttribute("data-add"), 10), qtyEl ? qtyEl.value : 1);
        } else if (t.hasAttribute("data-mas")) {
            cambiarCantidad(parseInt(t.getAttribute("data-mas"), 10), 1);
        } else if (t.hasAttribute("data-menos")) {
            cambiarCantidad(parseInt(t.getAttribute("data-menos"), 10), -1);
        } else if (t.hasAttribute("data-quitar")) {
            eliminar(parseInt(t.getAttribute("data-quitar"), 10));
        } else if (t.id === "btn-vaciar") {
            vaciar();
        } else if (t.id === "btn-finalizar") {
            finalizarPedido();
        }
    });

    /* ---------- Menú móvil ---------- */
    var toggle = document.getElementById("nav-toggle");
    var menu = document.getElementById("menu");
    if (toggle && menu) {
        function cerrar() {
            menu.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
        toggle.addEventListener("click", function () {
            var abierto = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
        });
        menu.addEventListener("click", function (e) { if (e.target.tagName === "A") cerrar(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });
        window.addEventListener("resize", function () { if (window.innerWidth > 900) cerrar(); });
    }

    /* ---------- Selector de cantidad (páginas de producto) ---------- */
    var qIn = document.getElementById("qty-input");
    if (qIn) {
        var ajustar = function (d) {
            qIn.value = Math.max(1, Math.min(20, (parseInt(qIn.value, 10) || 1) + d));
        };
        document.getElementById("qty-menos").addEventListener("click", function () { ajustar(-1); });
        document.getElementById("qty-mas").addEventListener("click", function () { ajustar(1); });
    }

    /* ---------- Formulario de contacto (sin servidor: abre el correo) ---------- */
    var form = document.getElementById("form-contacto");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var nota = document.getElementById("form-nota");
            var nombre = form.nombre.value.trim();
            var correo = form.correo.value.trim();
            var mensaje = form.mensaje.value.trim();
            if (!nombre || !/^\S+@\S+\.\S+$/.test(correo) || !mensaje) {
                nota.textContent = "Por favor completa tu nombre, un correo válido y el mensaje.";
                nota.style.color = "#b0554b";
                nota.className = "form-note show";
                return;
            }
            var asunto = "Consulta Faweb: " + form.interes.value;
            var cuerpo = mensaje + "\n\n— " + nombre + " (" + correo + ")";
            window.location.href = "mailto:contacto@faweb.com?subject=" + encodeURIComponent(asunto) +
                "&body=" + encodeURIComponent(cuerpo);
            nota.textContent = "¡Gracias, " + nombre + "! Se abrirá tu aplicación de correo para enviar el mensaje.";
            nota.style.color = "";
            nota.className = "form-note show";
            form.reset();
        });
    }

    /* ---------- Inicio ---------- */
    actualizarContador();
    renderCarrito();
})();
