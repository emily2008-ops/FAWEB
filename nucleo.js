/* =========================================================
   FAWEB · Núcleo compartido por todas las páginas públicas
   - Cliente de la API (fetch con sesión)
   - Utilidades: escapar HTML, formato de precios, avisos
   - Estado de sesión en el encabezado (Ingresar / Mi cuenta / Panel)
   - Datos de contacto desde MongoDB, menú móvil
========================================================= */
(function () {
    "use strict";

    var Faweb = (window.Faweb = window.Faweb || {});

    /* ---------- API ---------- */
    var SERVIDOR = "http://" + location.hostname + ":3000";

    Faweb.api = function (url, opciones) {
        opciones = opciones || {};
        url = SERVIDOR + url;
        var init = { method: opciones.method || "GET", credentials: "include", headers: { Accept: "application/json" } };
        if (opciones.body !== undefined) {
            init.headers["Content-Type"] = "application/json";
            init.body = JSON.stringify(opciones.body);
        }
        return fetch(url, init).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (datos) {
                if (!r.ok) {
                    var err = new Error(datos.mensaje || "Error " + r.status);
                    err.status = r.status;
                    err.errores = datos.errores || null;
                    throw err;
                }
                return datos;
            });
        });
    };

    /* ---------- Utilidades ---------- */
    Faweb.escapar = function (texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    };

    Faweb.precio = function (n) {
        return "$" + Number(n || 0).toLocaleString("es-CO");
    };

    // Solo se usan como imagen rutas propias o enlaces https/http
    Faweb.imagenSegura = function (url) {
        return typeof url === "string" && /^(https?:\/\/|\/uploads\/)/i.test(url) ? url : "";
    };

    Faweb.parametro = function (nombre) {
        return new URLSearchParams(window.location.search).get(nombre);
    };

    var toastTimer;
    Faweb.aviso = function (texto, tipo) {
        var t = document.getElementById("toast");
        if (!t) return;
        t.textContent = texto;
        t.className = "toast show" + (tipo ? " toast-" + tipo : "");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.className = "toast"; }, 2800);
    };

    /* ---------- Sesión ---------- */
    var promesaSesion = null;
    Faweb.sesion = function (forzar) {
        if (!promesaSesion || forzar) {
            promesaSesion = Faweb.api("/login/verificar").then(function (datos) {
                return { autenticado: true, usuario: datos.usuario };
            }).catch(function () {
                return { autenticado: false, usuario: null };
            });
        }
        return promesaSesion;
    };

    Faweb.cerrarSesion = function () {
        return Faweb.api("/login/logout", { method: "POST" }).then(function () {
            window.location.href = "index.html?sesion=cerrada";
        }).catch(function (e) { Faweb.aviso(e.message, "error"); });
    };

    function pintarCuenta(estado) {
        var caja = document.getElementById("cuenta");
        if (!caja) return;
        if (!estado.autenticado) {
            var siguiente = encodeURIComponent(location.pathname + location.search);
            var enAuth = /\/(login|registro)\.html$/.test(location.pathname);
            caja.innerHTML = '<a href="login.html' + (enAuth ? "" : "?next=" + siguiente) + '" class="cuenta-btn">👤 <span>Ingresar</span></a>';
            return;
        }
        var u = estado.usuario;
        var inicial = Faweb.escapar((u.nombre || "?").trim().charAt(0).toUpperCase());
        var esAdmin = u.rol === "admin";
        caja.innerHTML =
            '<button type="button" class="cuenta-btn cuenta-abrir" aria-haspopup="true" aria-expanded="false">' +
                '<span class="avatar">' + inicial + "</span><span>" + Faweb.escapar(u.nombre.split(" ")[0]) + "</span>" +
            "</button>" +
            '<div class="cuenta-menu" role="menu" hidden>' +
                '<div class="cuenta-datos"><strong>' + Faweb.escapar(u.nombre) + "</strong><small>" + Faweb.escapar(u.correo) + "</small>" +
                '<span class="rol-pill ' + (esAdmin ? "rol-admin" : "") + '">' + (esAdmin ? "Administrador" : "Usuario") + "</span></div>" +
                (esAdmin ? '<a href="admin.html" role="menuitem">⚙️ Panel administrativo</a>' : "") +
                '<a href="carrito.html" role="menuitem">🛒 Mi carrito</a>' +
                '<button type="button" role="menuitem" data-cerrar-sesion>↩ Cerrar sesión</button>' +
            "</div>";
    }

    document.addEventListener("click", function (e) {
        var abrir = e.target.closest(".cuenta-abrir");
        var menu = document.querySelector(".cuenta-menu");
        if (abrir && menu) {
            var oculto = menu.hidden;
            menu.hidden = !oculto;
            abrir.setAttribute("aria-expanded", String(oculto));
            return;
        }
        if (e.target.closest("[data-cerrar-sesion]")) {
            Faweb.cerrarSesion();
            return;
        }
        if (menu && !e.target.closest("#cuenta")) {
            menu.hidden = true;
            var b = document.querySelector(".cuenta-abrir");
            if (b) b.setAttribute("aria-expanded", "false");
        }
    });

    /* ---------- Información general (MongoDB: colección configuracion) ---------- */
    var promesaConfig = null;
    Faweb.config = function () {
        if (!promesaConfig) {
            promesaConfig = Faweb.api("/configuracion").catch(function () { return {}; });
        }
        return promesaConfig;
    };

    function pintarConfig(cfg) {
        document.querySelectorAll("[data-config]").forEach(function (el) {
            var v = cfg[el.getAttribute("data-config")];
            if (v) el.textContent = v;
        });
    }

    /* ---------- Menú móvil ---------- */
    function iniciarMenu() {
        var toggle = document.getElementById("nav-toggle");
        var menu = document.getElementById("menu");
        if (!toggle || !menu) return;
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

    /* ---------- Mostrar/ocultar contraseña ---------- */
    document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-ver-clave]");
        if (!b) return;
        var input = document.getElementById(b.getAttribute("data-ver-clave"));
        if (!input) return;
        var mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        b.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
    });

    /* ---------- Inicio ---------- */
    iniciarMenu();
    document.querySelectorAll("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    Faweb.sesion().then(pintarCuenta);
    Faweb.config().then(pintarConfig);

    if (Faweb.parametro("acceso") === "denegado") {
        setTimeout(function () { Faweb.aviso("Esa sección es solo para administradores.", "error"); }, 300);
    }
    if (Faweb.parametro("sesion") === "cerrada") {
        setTimeout(function () { Faweb.aviso("Cerraste sesión correctamente. ¡Hasta pronto!"); }, 300);
    }
})();
