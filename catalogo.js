
document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/producto';

    const contenedor = document.getElementById('contenedor-productos');
    const buscar = document.getElementById('buscar');
    const orden = document.getElementById('orden');
    const soloDisponibles = document.getElementById('solo-disponibles');
    const conteo = document.getElementById('conteo');
    const chips = document.getElementById('chips-categorias');

    let productos = [];
    let filtroExclusivos = false;

    // Escapar texto para evitar insertar HTML de los datos
    function crearTexto(tag, texto, clase) {
        const elemento = document.createElement(tag);
        elemento.textContent = texto ?? '';

        if (clase) {
            elemento.className = clase;
        }

        return elemento;
    }

    // Formatear precios en pesos colombianos
    function formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(precio) || 0);
    }

    // Validar imágenes
    function validarImagen(url) {
        if (!url || typeof url !== 'string') return '';

        const limpia = url.trim();

        if (
            limpia.startsWith('http://') ||
            limpia.startsWith('https://') ||
            limpia.startsWith('/') ||
            limpia.startsWith('./') ||
            limpia.startsWith('../')
        ) {
            return limpia;
        }

        return '';
    }

    // Mostrar mensajes
    function mostrarEstado(mensaje, error = false) {
        contenedor.replaceChildren();

        const estado = crearTexto(
            'div',
            mensaje,
            error ? 'cards-estado error' : 'cards-estado'
        );

        contenedor.appendChild(estado);
    }

    // Crear tarjeta de producto
    function crearTarjeta(producto) {

        const id = producto._id || producto.id;

        const nombre = producto.nombre || 'Producto sin nombre';

        const precio = formatearPrecio(producto.precio);

        const descripcion =
            producto.descripcion ||
            producto.resumen ||
            'Sin descripción disponible.';

        const imagen = validarImagen(
            producto.imagenTarjeta || producto.imagen
        );

        const disponible = producto.disponible !== false &&
            !(Number.isFinite(Number(producto.stock)) &&
              producto.stock !== null &&
              producto.stock !== '' &&
              Number(producto.stock) <= 0);

        const tarjeta = document.createElement('article');

        tarjeta.className = 'card producto-card';

        tarjeta.dataset.producto = id || '';

        // Etiqueta de producto exclusivo
        if (producto.exclusivo) {
            tarjeta.classList.add('premium-card');

            const insignia = crearTexto(
                'div',
                'EXCLUSIVO',
                'premium-badge'
            );

            tarjeta.appendChild(insignia);
        }

        // Imagen
        const contenedorImagen = document.createElement('div');
        contenedorImagen.className = 'card-image';

        if (imagen) {

            const img = document.createElement('img');

            img.src = imagen;
            img.alt = nombre;
            img.loading = 'lazy';

            img.onerror = function () {
                this.remove();

                const vacia = crearTexto(
                    'div',
                    'faweb',
                    'imagen-vacia'
                );

                vacia.setAttribute('role', 'img');
                vacia.setAttribute('aria-label', nombre);

                contenedorImagen.appendChild(vacia);
            };

            contenedorImagen.appendChild(img);

        } else {

            const vacia = crearTexto(
                'div',
                'faweb',
                'imagen-vacia'
            );

            vacia.setAttribute('role', 'img');
            vacia.setAttribute('aria-label', nombre);

            contenedorImagen.appendChild(vacia);
        }

        tarjeta.appendChild(contenedorImagen);

        // Información del producto
        const contenido = document.createElement('div');
        contenido.className = 'card-content';

        const referencia = producto.numero
            ? 'REF. ' + producto.numero
            : 'PRODUCTO FAWEB';

        contenido.appendChild(
            crearTexto('span', referencia, 'category-label')
        );

        contenido.appendChild(
            crearTexto('h3', nombre)
        );

        contenido.appendChild(
            crearTexto('p', descripcion, 'recorte')
        );

        if (Array.isArray(producto.caracteristicas) &&
            producto.caracteristicas.length > 0) {

            const lista = document.createElement('ul');
            lista.className = 'feature-list';

            producto.caracteristicas.forEach(caracteristica => {
                lista.appendChild(
                    crearTexto('li', caracteristica)
                );
            });

            contenido.appendChild(lista);
        }

        // Precio y botón
        const inferior = document.createElement('div');
        inferior.className = 'card-bottom';

        inferior.appendChild(
            crearTexto('span', precio)
        );

        const boton = crearTexto(
            'button',
            disponible ? 'Agregar 🛒' : 'Agotado'
        );

        boton.type = 'button';
        boton.dataset.add = id || '';
        boton.dataset.nombre = nombre;
        boton.disabled = !disponible || !id;

        inferior.appendChild(boton);

        contenido.appendChild(inferior);

        tarjeta.appendChild(contenido);

        if (!disponible) {
            tarjeta.classList.add('no-disponible');

            const insignia = crearTexto(
                'div',
                'AGOTADO',
                'premium-badge badge-agotado'
            );

            tarjeta.insertBefore(insignia, tarjeta.firstChild);
        }

        return tarjeta;
    }

    // Mostrar productos en pantalla
    function mostrarProductos(lista) {

        contenedor.replaceChildren();

        conteo.textContent =
            lista.length +
            (lista.length === 1
                ? ' producto encontrado'
                : ' productos encontrados');

        if (lista.length === 0) {
            mostrarEstado('No encontramos productos con esos filtros.');
            return;
        }

        lista.forEach(producto => {
            contenedor.appendChild(crearTarjeta(producto));
        });

        contenedor.classList.toggle('cards-pocas', lista.length < 4);
    }

    // Aplicar búsqueda, filtros y orden
    function aplicarFiltros() {

        let resultado = [...productos];

        const busqueda = buscar.value.trim().toLowerCase();

        if (busqueda) {
            resultado = resultado.filter(producto => {

                const texto = [
                    producto.nombre,
                    producto.numero,
                    producto.descripcion,
                    producto.resumen
                ].join(' ').toLowerCase();

                return texto.includes(busqueda);
            });
        }

        if (soloDisponibles.checked) {
            resultado = resultado.filter(producto => {

                const tieneStock = producto.stock === undefined ||
                    producto.stock === null ||
                    Number(producto.stock) > 0;

                return producto.disponible !== false && tieneStock;
            });
        }

        if (filtroExclusivos) {
            resultado = resultado.filter(producto => producto.exclusivo);
        }

        switch (orden.value) {

            case 'precio-asc':
                resultado.sort((a, b) =>
                    Number(a.precio || 0) - Number(b.precio || 0)
                );
                break;

            case 'precio-desc':
                resultado.sort((a, b) =>
                    Number(b.precio || 0) - Number(a.precio || 0)
                );
                break;

            case 'nombre':
                resultado.sort((a, b) =>
                    (a.nombre || '').localeCompare(
                        b.nombre || '',
                        'es',
                        { sensitivity: 'base' }
                    )
                );
                break;

            default:
                resultado.sort((a, b) => {
                    const fechaA = a.creadoEn
                        ? new Date(a.creadoEn).getTime()
                        : 0;

                    const fechaB = b.creadoEn
                        ? new Date(b.creadoEn).getTime()
                        : 0;

                    return fechaB - fechaA;
                });
        }

        mostrarProductos(resultado);
    }

    // Crear filtros de productos
    function crearFiltros() {

        chips.replaceChildren();

        const todos = crearTexto(
            'button',
            'Todos',
            'chip activo'
        );

        todos.type = 'button';
        todos.dataset.tipo = 'todos';
        todos.setAttribute('aria-pressed', 'true');

        const exclusivos = crearTexto(
            'button',
            'Exclusivos',
            'chip'
        );

        exclusivos.type = 'button';
        exclusivos.dataset.tipo = 'exclusivos';
        exclusivos.setAttribute('aria-pressed', 'false');

        chips.append(todos, exclusivos);

        chips.addEventListener('click', event => {

            const boton = event.target.closest('.chip');

            if (!boton) return;

            filtroExclusivos =
                boton.dataset.tipo === 'exclusivos';

            chips.querySelectorAll('.chip').forEach(chip => {

                const activo = chip === boton;

                chip.classList.toggle('activo', activo);

                chip.setAttribute(
                    'aria-pressed',
                    String(activo)
                );
            });

            aplicarFiltros();
        });
    }

    // Consultar MongoDB mediante el servidor
    async function cargarProductos() {

        mostrarEstado('Cargando productos...');

        try {

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error(
                    'Error del servidor: ' + respuesta.status
                );
            }

            const datos = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error(
                    'El servidor no devolvió una lista de productos.'
                );
            }

            productos = datos;

            crearFiltros();

            aplicarFiltros();

        } catch (error) {

            console.error('Error al cargar productos:', error);

            mostrarEstado(
                'No se pudieron cargar los productos. Verifica que el servidor y MongoDB estén funcionando.',
                true
            );
        }
    }

    // Eventos de búsqueda y filtros
    let temporizador;

    buscar.addEventListener('input', () => {
        clearTimeout(temporizador);

        temporizador = setTimeout(() => {
            aplicarFiltros();
        }, 300);
    });

    orden.addEventListener('change', aplicarFiltros);

    soloDisponibles.addEventListener(
        'change',
        aplicarFiltros
    );

    document.getElementById('filtros').addEventListener(
        'submit',
        event => event.preventDefault()
    );

    // Iniciar catálogo
    cargarProductos();

});
