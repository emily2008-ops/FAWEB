
const API_URL = 'http://localhost:3000/producto';
const TIEMPO_MAXIMO = 8000;

document.addEventListener('DOMContentLoaded', cargarCategorias);

async function cargarCategorias() {
    const contenedor = document.getElementById('categories-container');

    if (!contenedor) {
        console.error('No se encontró categories-container');
        return;
    }

    const inicio = performance.now();
    const controlador = new AbortController();

    const temporizador = setTimeout(() => {
        controlador.abort();
    }, TIEMPO_MAXIMO);

    contenedor.innerHTML = `
        <div class="cards-estado cargando" role="status">
            <span class="spinner"></span>
            Cargando categorías...
        </div>
    `;

    try {
        const respuesta = await fetch(API_URL, {
            method: 'GET',
            signal: controlador.signal,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status}`);
        }

        const categorias = await respuesta.json();

        if (!Array.isArray(categorias)) {
            throw new Error('El servidor no devolvió una lista de categorías');
        }

        contenedor.replaceChildren();

        if (categorias.length === 0) {
            contenedor.textContent = 'No hay categorías registradas.';
            return;
        }

        const fragmento = document.createDocumentFragment();

        categorias.forEach((categoria, index) => {
            const tarjeta = document.createElement('article');
            tarjeta.className = 'card';

            if (categoria.exclusivo) {
                tarjeta.classList.add('premium-card');

                const insignia = document.createElement('div');
                insignia.className = 'premium-badge';
                insignia.textContent = 'EXCLUSIVO';

                tarjeta.appendChild(insignia);
            }

            const imagenContenedor = document.createElement('div');
            imagenContenedor.className = 'card-image';

            const enlaceImagen = document.createElement('a');
            enlaceImagen.href =
                `productos.html?id=${encodeURIComponent(categoria._id)}`;

            const imagen = document.createElement('img');

            imagen.src = categoria.imagenTarjeta || categoria.imagen || '';
            imagen.alt = categoria.nombre || 'Categoría';
            imagen.loading = 'lazy';
            imagen.decoding = 'async';

            enlaceImagen.appendChild(imagen);
            imagenContenedor.appendChild(enlaceImagen);

            const contenido = document.createElement('div');
            contenido.className = 'card-content';

            const etiqueta = document.createElement('span');
            etiqueta.className = 'category-label';
            etiqueta.textContent =
                `CATEGORÍA ${String(categoria.numero || index + 1).padStart(2, '0')}`;

            const titulo = document.createElement('h3');

            const enlaceTitulo = document.createElement('a');
            enlaceTitulo.href = enlaceImagen.href;
            enlaceTitulo.textContent = categoria.nombre || 'Sin nombre';

            titulo.appendChild(enlaceTitulo);

            const descripcion = document.createElement('p');
            descripcion.textContent = categoria.resumen || '';

            const detalles = document.createElement('a');
            detalles.className = 'card-link';
            detalles.href = enlaceImagen.href;
            detalles.textContent = 'Ver detalles →';

            const parteInferior = document.createElement('div');
            parteInferior.className = 'card-bottom';

            const precio = document.createElement('span');

            precio.textContent = categoria.precio != null
                ? `Desde $${Number(categoria.precio).toLocaleString('es-CO')}`
                : 'Consultar precio';

            parteInferior.appendChild(precio);

            contenido.append(
                etiqueta,
                titulo,
                descripcion,
                detalles,
                parteInferior
            );

            tarjeta.append(
                imagenContenedor,
                contenido
            );

            fragmento.appendChild(tarjeta);
        });

        contenedor.appendChild(fragmento);

        const tiempo = (performance.now() - inicio).toFixed(2);

        console.log(`Categorías cargadas: ${categorias.length}`);
        console.log(`Tiempo de respuesta y procesamiento: ${tiempo} ms`);

    } catch (error) {

        console.error('Error cargando categorías:', error);

        if (error.name === 'AbortError') {
            contenedor.textContent =
                'La conexión está tardando demasiado. Intenta nuevamente.';
        } else {
            contenedor.textContent =
                'No fue posible cargar las categorías. Verifica el servidor.';
        }

    } finally {
        clearTimeout(temporizador);
    }
}
