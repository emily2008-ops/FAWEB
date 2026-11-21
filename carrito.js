
/* =========================================
   FAWEB - CARRITO DE COMPRAS
========================================= */

const API_URL = "http://localhost:3000/producto";
const CLAVE_CARRITO = "faweb_carrito_v2";

let carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
let productos = [];

/* Guardar el carrito en el navegador */
function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    actualizarContador();
}

/* Contar las unidades del carrito */
function actualizarContador() {
    const contador = document.getElementById("contador");

    if (contador) {
        contador.textContent = carrito.reduce(
            (total, producto) => total + producto.cantidad,
            0
        );
    }
}

/* Mostrar mensajes */
function mostrarMensaje(mensaje) {
    if (window.Faweb && typeof window.Faweb.aviso === "function") {
        window.Faweb.aviso(mensaje);
    } else {
        alert(mensaje);
    }
}

/* Formatear precios en pesos colombianos */
function formatoPrecio(precio) {
    return "$" + Number(precio || 0).toLocaleString("es-CO");
}

/* Evitar problemas al mostrar textos */
function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

/* Consultar productos en MongoDB */
async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los productos.");
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("La respuesta del servidor no es una lista de productos.");
        }

        productos = datos.map(producto => ({
            ...producto,
            id: producto._id || producto.id
        }));

        mostrarCarrito();

    } catch (error) {
        console.error("Error al cargar productos:", error);

        const lista = document.getElementById("lista-carrito");

        if (lista) {
            lista.innerHTML = "<p>No se pudieron cargar los productos. Verifica que el servidor esté funcionando.</p>";
        }
    }
}

/* Agregar un producto */
function agregarAlCarrito(id, nombre, cantidad = 1) {
    if (!id) {
        mostrarMensaje("No se encontró el identificador del producto.");
        return;
    }

    cantidad = Math.max(1, parseInt(cantidad, 10) || 1);

    const producto = productos.find(p => String(p.id) === String(id));

    if (producto && !estaDisponible(producto)) {
        mostrarMensaje("Este producto no está disponible.");
        return;
    }

    const existente = carrito.find(p => String(p.id) === String(id));

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            id: String(id),
            cantidad: cantidad
        });
    }

    guardarCarrito();
    mostrarMensaje((nombre || "Producto") + " agregado al carrito.");
}

/* Comprobar disponibilidad */
function estaDisponible(producto) {
    if (producto.disponible === false) return false;

    if (producto.stock !== undefined && producto.stock !== null) {
        return Number(producto.stock) > 0;
    }

    return true;
}

/* Cambiar cantidad */
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(p => String(p.id) === String(id));

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    guardarCarrito();
    mostrarCarrito();
}

/* Eliminar un producto */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => String(p.id) !== String(id));

    guardarCarrito();
    mostrarCarrito();
}

/* Vaciar todo el carrito */
function vaciarCarrito() {
    carrito = [];

    guardarCarrito();
    mostrarCarrito();

    mostrarMensaje("El carrito está vacío.");
}

/* Mostrar los productos del carrito */
function mostrarCarrito() {
    const lista = document.getElementById("lista-carrito");

    if (!lista) return;

    const mensaje = document.getElementById("mensaje-carrito");
    const totalDiv = document.getElementById("total-carrito");
    const totalValor = document.getElementById("total-valor");
    const nota = document.getElementById("nota-carrito");
    const btnFinalizar = document.getElementById("btn-finalizar");
    const btnVaciar = document.getElementById("btn-vaciar");

    let total = 0;
    let agotados = 0;

    const productosDelCarrito = carrito.map(item => {
        const producto = productos.find(
            p => String(p.id) === String(item.id)
        );

        return producto ? { ...producto, cantidad: item.cantidad } : null;
    }).filter(Boolean);

    if (productosDelCarrito.length === 0) {
        lista.innerHTML = "";

        if (mensaje) mensaje.textContent = "Todavía no has agregado ningún producto.";
        if (totalDiv) totalDiv.classList.remove("visible");
        if (btnFinalizar) btnFinalizar.hidden = true;
        if (btnVaciar) btnVaciar.hidden = true;
        if (nota) nota.hidden = true;

        return;
    }

    lista.innerHTML = productosDelCarrito.map(producto => {
        const disponible = estaDisponible(producto);
        const precio = Number(producto.precio) || 0;
        const subtotal = precio * producto.cantidad;

        if (disponible) {
            total += subtotal;
        } else {
            agotados++;
        }

        const imagen = producto.imagen || producto.imagenTarjeta || "";

        return `
            <div class="cart-item ${disponible ? "" : "agotado"}">

                ${
                    imagen
                        ? `<img class="item-img" src="${escapar(imagen)}" alt="${escapar(producto.nombre)}">`
                        : `<span class="item-img item-img-vacia">🛍️</span>`
                }

                <div class="item-info">
                    <strong>${escapar(producto.nombre)}</strong>

                    <small>
                        ${formatoPrecio(precio)} c/u
                        ${disponible ? "" : '<span class="texto-agotado">Agotado</span>'}
                    </small>
                </div>

                <div class="item-controls">
                    <button type="button" class="qty-btn" data-menos="${escapar(producto.id)}">−</button>

                    <span class="qty-num">${producto.cantidad}</span>

                    <button type="button" class="qty-btn" data-mas="${escapar(producto.id)}">+</button>
                </div>

                <span class="item-subtotal">
                    ${formatoPrecio(subtotal)}
                </span>

                <button type="button" data-quitar="${escapar(producto.id)}" aria-label="Eliminar producto">
                    ✕
                </button>

            </div>
        `;
    }).join("");

    if (mensaje) {
        mensaje.textContent = "Has seleccionado " + carrito.reduce((s, p) => s + p.cantidad, 0) + " producto(s).";
    }

    if (totalDiv) totalDiv.classList.add("visible");
    if (totalValor) totalValor.textContent = formatoPrecio(total);
    if (nota) {
        nota.hidden = agotados === 0;
        nota.textContent = agotados > 0
            ? "Los productos agotados no se incluyen en el total."
            : "";
    }

    if (btnFinalizar) btnFinalizar.hidden = total === 0;
    if (btnVaciar) btnVaciar.hidden = false;
}

/* Finalizar pedido */
async function finalizarPedido() {
    const F = window.Faweb;

    if (!F || typeof F.sesion !== "function" || typeof F.config !== "function") {
        mostrarMensaje("Inicia sesión para continuar con tu pedido.");
        window.location.href = "login.html?next=carrito.html";
        return;
    }

    try {
        const [sesion, config] = await Promise.all([
            F.sesion(true),
            F.config()
        ]);

        if (!sesion.autenticado) {
            mostrarMensaje("Inicia sesión para finalizar tu pedido.");

            setTimeout(() => {
                window.location.href = "login.html?next=carrito.html";
            }, 800);

            return;
        }

        let total = 0;

        const lineas = carrito
            .map(item => {
                const producto = productos.find(p => String(p.id) === String(item.id));

                if (!producto || !estaDisponible(producto)) return "";

                const subtotal = Number(producto.precio || 0) * item.cantidad;
                total += subtotal;

                return `${item.cantidad} x ${producto.nombre} (${formatoPrecio(subtotal)})`;
            })
            .filter(Boolean);

        if (lineas.length === 0) {
            mostrarMensaje("No hay productos disponibles para realizar el pedido.");
            return;
        }

        const usuario = sesion.usuario;
        const texto =
            "Hola " + (config.nombreTienda || "Faweb") + ", quiero realizar este pedido:\n\n" +
            lineas.join("\n") +
            "\n\nTotal: " + formatoPrecio(total) +
            "\n\nCliente: " + usuario.nombre +
            " (" + usuario.correo + ")";

        const numero = String(config.whatsapp || "").replace(/\D/g, "");

        if (!numero) {
            mostrarMensaje("No se ha configurado el número de WhatsApp de la tienda.");
            return;
        }

        window.open(
            "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto),
            "_blank"
        );

    } catch (error) {
        console.error("Error al finalizar el pedido:", error);
        mostrarMensaje("No se pudo finalizar el pedido. Inténtalo nuevamente.");
    }
}

/* Detectar los clics de los botones */
document.addEventListener("click", function(event) {
    const boton = event.target.closest("button");

    if (!boton) return;

    if (boton.hasAttribute("data-add")) {
        const id = boton.getAttribute("data-add");
        const nombre = boton.getAttribute("data-nombre");

        const selector = boton.getAttribute("data-qty-from");
        const campoCantidad = selector ? document.querySelector(selector) : null;
        const cantidad = campoCantidad ? campoCantidad.value : 1;

        agregarAlCarrito(id, nombre, cantidad);
    }

    if (boton.hasAttribute("data-mas")) {
        cambiarCantidad(boton.getAttribute("data-mas"), 1);
    }

    if (boton.hasAttribute("data-menos")) {
        cambiarCantidad(boton.getAttribute("data-menos"), -1);
    }

    if (boton.hasAttribute("data-quitar")) {
        eliminarDelCarrito(boton.getAttribute("data-quitar"));
    }

    if (boton.id === "btn-vaciar") {
        vaciarCarrito();
    }

    if (boton.id === "btn-finalizar") {
        finalizarPedido();
    }
});

/* Iniciar el carrito */
actualizarContador();
cargarProductos();
