"use strict";

const API = "http://localhost:3000";

const tablaUsuarios = document.getElementById("tablaUsuarios");
const tablaProductos = document.getElementById("tablaProductos");

const modal = document.getElementById("modalEdicion");
const formulario = document.getElementById("formEdicion");
const camposFormulario = document.getElementById("camposFormulario");
const botonGuardar = document.getElementById("botonGuardar");

let tipoEdicion = "";   // "usuario" o "producto"
let idEdicion = "";     // vacío = crear nuevo, con valor = editar

document.addEventListener("DOMContentLoaded", async () => {
    // Solo entra al panel quien inició sesión como administrador
    const usuario = await verificarAdmin();
    if (!usuario) return;

    document.getElementById("nombreAdmin").textContent = "👤 " + usuario.nombre;

    cargarUsuarios();
    cargarProductos();

    document.querySelectorAll(".menu-option").forEach(boton => {
        boton.addEventListener("click", () => {
            cambiarSeccion(boton.dataset.section);
        });
    });

    document.getElementById("recargarUsuarios")
        .addEventListener("click", cargarUsuarios);

    document.getElementById("recargarProductos")
        .addEventListener("click", cargarProductos);

    document.getElementById("agregarUsuario")
        .addEventListener("click", abrirNuevoUsuario);

    document.getElementById("agregarProducto")
        .addEventListener("click", abrirNuevoProducto);

    document.getElementById("cerrarModal")
        .addEventListener("click", cerrarModal);

    document.getElementById("cancelarEdicion")
        .addEventListener("click", cerrarModal);

    // Cerrar el modal al hacer clic fuera del cuadro
    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrarModal();
    });

    formulario.addEventListener("submit", guardarCambios);
});

async function verificarAdmin() {
    try {
        const respuesta = await fetch("http://" + location.hostname + ":3000/login/verificar", {
            credentials: "include"
        });
        const datos = await respuesta.json();

        if (datos.success && datos.usuario.rol === "admin") {
            return datos.usuario;
        }
    } catch (error) {
        console.error(error);
    }

    window.location.href = "login.html?next=admin.html";
    return null;
}

function cambiarSeccion(nombre) {
    document.querySelectorAll(".section").forEach(seccion => {
        seccion.classList.remove("active");
    });

    document.querySelectorAll(".menu-option").forEach(boton => {
        boton.classList.remove("active");
    });

    document.getElementById(nombre).classList.add("active");

    document.querySelector(
        `.menu-option[data-section="${nombre}"]`
    ).classList.add("active");
}

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        }
    });

    const texto = await respuesta.text();
    let datos = {};

    try {
        datos = texto ? JSON.parse(texto) : {};
    } catch {
        // El servidor respondió HTML (ej. "Cannot POST /usuarios") en vez de JSON
        const rutaFaltante = texto.match(/Cannot (\w+) ([^<\s]+)/);
        datos = {
            mensaje: rutaFaltante
                ? `El servidor no tiene la ruta ${rutaFaltante[1]} ${rutaFaltante[2]}`
                : "El servidor respondió algo inesperado"
        };
    }

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo completar la operación");
    }

    return datos;
}

function obtenerLista(datos) {
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos.usuarios)) return datos.usuarios;
    if (Array.isArray(datos.productos)) return datos.productos;
    if (Array.isArray(datos.data)) return datos.data;

    return [];
}

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

// ==============================
// USUARIOS
// ==============================

async function cargarUsuarios() {
    tablaUsuarios.innerHTML = `
        <tr><td colspan="5">Cargando usuarios...</td></tr>
    `;

    try {
        const respuesta = await solicitar(`${API}/usuarios`);
        const usuarios = obtenerLista(respuesta);

        if (!usuarios.length) {
            tablaUsuarios.innerHTML = `
                <tr><td colspan="5">No hay usuarios registrados.</td></tr>
            `;
            return;
        }

        tablaUsuarios.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${escapar(usuario.nombre)}</td>
                <td>${escapar(usuario.correo)}</td>
                <td>${escapar(usuario.rol || "usuario")}</td>
                <td>${usuario.estado === false ? "Inactivo" : "Activo"}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="editar-usuario"
                        data-id="${escapar(usuario._id)}">
                        Editar
                    </button>

                    <button class="action-button delete-button"
                        data-action="eliminar-usuario"
                        data-id="${escapar(usuario._id)}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        tablaUsuarios.innerHTML = `
            <tr><td colspan="5">${escapar(error.message)}</td></tr>
        `;
    }
}

// ==============================
// PRODUCTOS
// ==============================

async function cargarProductos() {
    tablaProductos.innerHTML = `
        <tr><td colspan="6">Cargando productos...</td></tr>
    `;

    try {
        const respuesta = await solicitar(`${API}/producto`);
        const productos = obtenerLista(respuesta);

        if (!productos.length) {
            tablaProductos.innerHTML = `
                <tr><td colspan="6">No hay productos registrados.</td></tr>
            `;
            return;
        }

        tablaProductos.innerHTML = productos.map(producto => {
            const foto = producto.imagenTarjeta || producto.imagen;
            return `
            <tr>
                <td>
                    ${foto
                        ? `<img class="product-image" src="${escapar(foto)}" alt="${escapar(producto.nombre)}">`
                        : "Sin imagen"}
                </td>
                <td>${escapar(producto.codigo || producto.numero)}</td>
                <td>${escapar(producto.nombre)}</td>
                <td>${formatoPrecio(producto.precio)}</td>
                <td>${producto.activo === false ? "Oculto" : "Visible"}${producto.exclusivo ? " · Exclusivo" : ""}</td>
                <td>
                    <button class="action-button edit-button"
                        data-action="editar-producto"
                        data-id="${escapar(producto._id)}">
                        Editar
                    </button>

                    <button class="action-button delete-button"
                        data-action="eliminar-producto"
                        data-id="${escapar(producto._id)}">
                        Eliminar
                    </button>
                </td>
            </tr>
            `;
        }).join("");

    } catch (error) {
        tablaProductos.innerHTML = `
            <tr><td colspan="6">${escapar(error.message)}</td></tr>
        `;
    }
}

// ==============================
// BOTONES DE LAS TABLAS
// ==============================

document.addEventListener("click", async evento => {
    const boton = evento.target.closest("[data-action]");

    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.action;

    if (accion === "editar-usuario") await abrirEdicionUsuario(id);
    if (accion === "eliminar-usuario") await eliminarUsuario(id);
    if (accion === "editar-producto") await abrirEdicionProducto(id);
    if (accion === "eliminar-producto") await eliminarProducto(id);
});

// ==============================
// CAMPOS DEL USUARIO
// ==============================

function camposUsuario(usuario = {}, esNuevo = false) {
    return `
        <div class="form-group">
            <label>Nombre</label>
            <input name="nombre" value="${escapar(usuario.nombre)}" required>
        </div>

        <div class="form-group">
            <label>Correo</label>
            <input type="email" name="correo"
                value="${escapar(usuario.correo)}" required>
        </div>

        <div class="form-group">
            <label>${esNuevo ? "Contraseña" : "Nueva contraseña (déjala vacía para no cambiarla)"}</label>
            <input type="password" name="password" minlength="8"
                autocomplete="new-password" ${esNuevo ? "required" : ""}>
        </div>

        <div class="form-group">
            <label>Rol</label>
            <select name="rol">
                <option value="usuario" ${usuario.rol !== "admin" ? "selected" : ""}>
                    Usuario
                </option>
                <option value="admin" ${usuario.rol === "admin" ? "selected" : ""}>
                    Administrador
                </option>
            </select>
        </div>

        <div class="form-group">
            <label>Estado</label>
            <select name="estado">
                <option value="true" ${usuario.estado !== false ? "selected" : ""}>
                    Activo
                </option>
                <option value="false" ${usuario.estado === false ? "selected" : ""}>
                    Inactivo
                </option>
            </select>
        </div>
    `;
}

// ==============================
// CAMPOS DEL PRODUCTO
// Si en tu base de datos algún campo se llama distinto,
// cambia SOLO el valor de "campo" aquí y todo lo demás se ajusta.
// ==============================

const CAMPOS_PRODUCTO = [
    { campo: "codigo", etiqueta: "Código", tipo: "texto", ayuda: "Ej: FW-00001 (vacío = se genera solo)" },
    { campo: "numero", etiqueta: "Número", tipo: "texto", ayuda: "Ej: 01" },
    { campo: "nombre", etiqueta: "Nombre", tipo: "texto", requerido: true, ayuda: "Ej: Baja" },
    { campo: "precio", etiqueta: "Precio (COP)", tipo: "numero", requerido: true, ayuda: "Ej: 30000" },
    { campo: "resumen", etiqueta: "Resumen corto", tipo: "area", filas: 2 },
    { campo: "descripcion", etiqueta: "Descripción completa", tipo: "area", filas: 4 },
    { campo: "caracteristicas", etiqueta: "Características (una por línea)", tipo: "lista", filas: 4 },
    { campo: "idealPara", etiqueta: "Ideal para", tipo: "texto", ayuda: "Ej: Uso diario y primeras compras" },
    { campo: "envio", etiqueta: "Envío", tipo: "texto", defecto: "A toda Colombia" },
    { campo: "garantia", etiqueta: "Garantía / devoluciones", tipo: "texto", defecto: "30 días" },
    { campo: "imagen", etiqueta: "Imagen del producto", tipo: "imagen" },
    { campo: "imagenTarjeta", tipo: "oculto" }, // se genera sola a partir de la imagen
    { campo: "exclusivo", etiqueta: "Exclusivo", tipo: "sino", defecto: false },
    { campo: "activo", etiqueta: "Visible en la tienda", tipo: "sino", defecto: true }
];

// Dibuja un campo del formulario según su tipo
function campoProductoHTML(def, producto) {
    const valor = producto[def.campo] ?? def.defecto ?? "";
    const id = `campo-${def.campo}`;
    const requerido = def.requerido ? "required" : "";
    const ayuda = escapar(def.ayuda || "");
    const ancho = ["area", "lista"].includes(def.tipo) ? "form-group full" : "form-group";

    let control = "";

    if (def.tipo === "oculto") {
        return `<input type="hidden" id="${id}" name="${def.campo}" value="${escapar(valor)}">`;
    }

    if (def.tipo === "imagen") {
        const esArchivo = String(valor).startsWith("data:");
        return `
        <div class="form-group full">
            <label>${escapar(def.etiqueta)}</label>
            <div class="subir-imagen">
                <img id="vistaPrevia" class="vista-previa" src="${escapar(valor)}" alt="Vista previa" ${valor ? "" : "hidden"}>
                <div class="subir-imagen-controles">
                    <label class="secondary-button boton-archivo">
                        📁 Elegir imagen
                        <input type="file" id="archivoImagen" accept="image/*" hidden>
                    </label>
                    <span id="estadoImagen" class="estado-imagen">${esArchivo ? "Imagen cargada" : ""}</span>
                    <input type="text" id="urlImagen" placeholder="…o pega la URL de una imagen"
                        value="${esArchivo ? "" : escapar(valor)}">
                </div>
            </div>
            <input type="hidden" id="${id}" name="${def.campo}" value="${escapar(valor)}">
        </div>`;
    }

    if (def.tipo === "area" || def.tipo === "lista") {
        const texto = def.tipo === "lista" && Array.isArray(valor) ? valor.join("\n") : valor;
        control = `<textarea id="${id}" name="${def.campo}" rows="${def.filas || 3}"
            placeholder="${ayuda}" ${requerido}>${escapar(texto)}</textarea>`;
    } else if (def.tipo === "sino") {
        const si = valor === true || valor === "true";
        control = `<select id="${id}" name="${def.campo}">
            <option value="true" ${si ? "selected" : ""}>Sí</option>
            <option value="false" ${!si ? "selected" : ""}>No</option>
        </select>`;
    } else if (def.tipo === "numero") {
        control = `<input id="${id}" type="number" name="${def.campo}" min="0" step="1"
            value="${escapar(valor)}" placeholder="${ayuda}" ${requerido}>`;
    } else {
        const tipoInput = def.tipo === "url" ? "url" : "text";
        control = `<input id="${id}" type="${tipoInput}" name="${def.campo}"
            value="${escapar(valor)}" placeholder="${ayuda}" ${requerido}>`;
    }

    return `
        <div class="${ancho}">
            <label for="${id}">${escapar(def.etiqueta)}${def.requerido ? " *" : ""}</label>
            ${control}
        </div>
    `;
}

function camposProducto(producto = {}) {
    return `<div class="form-grid">
        ${CAMPOS_PRODUCTO.map(def => campoProductoHTML(def, producto)).join("")}
    </div>`;
}

// Convierte lo que se escribió en el formulario al tipo correcto
// (número, verdadero/falso, lista) antes de enviarlo al servidor
function leerProducto(datosFormulario) {
    const producto = {};

    CAMPOS_PRODUCTO.forEach(def => {
        const valor = (datosFormulario[def.campo] ?? "").toString();

        if (def.tipo === "numero") {
            producto[def.campo] = Number(valor);
        } else if (def.tipo === "sino") {
            producto[def.campo] = valor === "true";
        } else if (def.tipo === "lista") {
            producto[def.campo] = valor.split("\n").map(linea => linea.trim()).filter(Boolean);
        } else {
            producto[def.campo] = valor.trim();
        }
    });

    return producto;
}

// ==============================
// SUBIR IMAGEN
// La imagen se reduce en el navegador y se guarda como texto (base64)
// dentro del producto. Se crean dos tamaños: grande y tarjeta.
// ==============================

function redimensionarImagen(archivo, anchoMaximo, calidad = 0.82) {
    return new Promise((resolver, rechazar) => {
        const lector = new FileReader();

        lector.onerror = () => rechazar(new Error("No se pudo leer la imagen"));
        lector.onload = () => {
            const imagen = new Image();
            imagen.onerror = () => rechazar(new Error("El archivo no es una imagen válida"));
            imagen.onload = () => {
                const escala = Math.min(1, anchoMaximo / imagen.width);
                const lienzo = document.createElement("canvas");
                lienzo.width = Math.round(imagen.width * escala);
                lienzo.height = Math.round(imagen.height * escala);
                lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
                resolver(lienzo.toDataURL("image/jpeg", calidad));
            };
            imagen.src = lector.result;
        };

        lector.readAsDataURL(archivo);
    });
}

function ponerImagen(grande, tarjeta) {
    document.getElementById("campo-imagen").value = grande;
    document.getElementById("campo-imagenTarjeta").value = tarjeta;

    const vista = document.getElementById("vistaPrevia");
    vista.src = grande;
    vista.hidden = !grande;
}

// Cuando se elige un archivo
document.addEventListener("change", async evento => {
    if (evento.target.id !== "archivoImagen") return;

    const archivo = evento.target.files[0];
    if (!archivo) return;

    const estado = document.getElementById("estadoImagen");

    if (!archivo.type.startsWith("image/")) {
        alert("Elige un archivo de imagen (JPG, PNG, WEBP...)");
        return;
    }

    estado.textContent = "Procesando…";
    botonGuardar.disabled = true;

    try {
        const grande = await redimensionarImagen(archivo, 900);
        const tarjeta = await redimensionarImagen(archivo, 700, 0.78);
        ponerImagen(grande, tarjeta);
        document.getElementById("urlImagen").value = "";
        estado.textContent = `✔ ${archivo.name}`;
    } catch (error) {
        estado.textContent = "";
        alert(error.message);
    } finally {
        botonGuardar.disabled = false;
    }
});

// Cuando se pega una URL en lugar de subir archivo
document.addEventListener("input", evento => {
    if (evento.target.id !== "urlImagen") return;

    const url = evento.target.value.trim();
    ponerImagen(url, url);
    document.getElementById("estadoImagen").textContent = "";
});

function formatoPrecio(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return escapar(valor);
    return numero.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    });
}

// ==============================
// ABRIR FORMULARIOS - CREAR
// ==============================

function abrirNuevoUsuario() {
    tipoEdicion = "usuario";
    idEdicion = "";

    document.getElementById("tituloModal").textContent = "Agregar usuario";
    botonGuardar.textContent = "Crear usuario";
    camposFormulario.innerHTML = camposUsuario({}, true);

    abrirModal();
}

function abrirNuevoProducto() {
    tipoEdicion = "producto";
    idEdicion = "";

    document.getElementById("tituloModal").textContent = "Agregar producto";
    botonGuardar.textContent = "Crear producto";
    camposFormulario.innerHTML = camposProducto();

    abrirModal();
}

// ==============================
// ABRIR FORMULARIOS - EDITAR
// ==============================

async function abrirEdicionUsuario(id) {
    try {
        const respuesta = await solicitar(`${API}/usuarios`);
        const usuario = obtenerLista(respuesta).find(item => item._id === id);

        if (!usuario) throw new Error("No se encontró el usuario.");

        tipoEdicion = "usuario";
        idEdicion = id;

        document.getElementById("tituloModal").textContent = "Editar usuario";
        botonGuardar.textContent = "Guardar cambios";
        camposFormulario.innerHTML = camposUsuario(usuario);

        abrirModal();

    } catch (error) {
        alert(error.message);
    }
}

async function abrirEdicionProducto(id) {
    try {
        const respuesta = await solicitar(`${API}/producto`);
        const producto = obtenerLista(respuesta).find(item => item._id === id);

        if (!producto) throw new Error("No se encontró el producto.");

        tipoEdicion = "producto";
        idEdicion = id;

        document.getElementById("tituloModal").textContent = "Editar producto";
        botonGuardar.textContent = "Guardar cambios";
        camposFormulario.innerHTML = camposProducto(producto);

        abrirModal();

    } catch (error) {
        alert(error.message);
    }
}

function abrirModal() {
    modal.classList.add("show");
    const primerCampo = camposFormulario.querySelector("input:not([type=hidden]), select, textarea");
    if (primerCampo) primerCampo.focus();
}

function cerrarModal() {
    modal.classList.remove("show");
    formulario.reset();
    camposFormulario.innerHTML = "";
    tipoEdicion = "";
    idEdicion = "";
}

// ==============================
// GUARDAR (CREAR o EDITAR)
// ==============================

async function guardarCambios(evento) {
    evento.preventDefault();

    let datos = Object.fromEntries(new FormData(formulario).entries());
    const esNuevo = !idEdicion;
    const tipo = tipoEdicion; // se guarda porque cerrarModal() lo borra

    // Sin id → POST (crear). Con id → PUT (editar)
    const metodo = esNuevo ? "POST" : "PUT";
    let url = "";

    if (tipo === "usuario") {
        url = esNuevo ? `${API}/usuarios` : `${API}/usuarios/${idEdicion}`;
        datos.estado = datos.estado === "true"; // el servidor guarda true/false
        if (!datos.password) delete datos.password; // al editar, vacía = no cambiar
    }

    if (tipo === "producto") {
        url = esNuevo ? `${API}/producto` : `${API}/producto/${idEdicion}`;
        datos = leerProducto(datos);
    }

    if (!url) return;

    botonGuardar.disabled = true; // evita que se guarde dos veces

    try {
        await solicitar(url, {
            method: metodo,
            body: JSON.stringify(datos)
        });

        alert(esNuevo
            ? `El ${tipo} se creó correctamente.`
            : "Los cambios se guardaron correctamente.");

        cerrarModal();

        if (tipo === "usuario") {
            await cargarUsuarios();
        } else {
            await cargarProductos();
        }

    } catch (error) {
        alert(error.message);
    } finally {
        botonGuardar.disabled = false;
    }
}

// ==============================
// ELIMINAR REGISTROS
// ==============================

async function eliminarUsuario(id) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
        await solicitar(`${API}/usuarios/${id}`, { method: "DELETE" });
        alert("Usuario eliminado correctamente.");
        await cargarUsuarios();
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
        await solicitar(`${API}/producto/${id}`, { method: "DELETE" });
        alert("Producto eliminado correctamente.");
        await cargarProductos();
    } catch (error) {
        alert(error.message);
    }
}