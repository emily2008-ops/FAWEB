/* =================================================================
   FAWEB · DATOS DEL SITIO  —  ¡EDITA SOLO ESTE ARCHIVO!
   -----------------------------------------------------------------
   Todo lo que cambies aquí se actualiza solo en TODAS las páginas:
   inicio, catálogo, páginas de cada categoría, carrito y contacto.

   Reglas para no romper nada:
   • El texto va siempre entre comillas "así".
   • Los precios van SIN puntos ni signo $:   precio: 200000,
   • No borres las comas del final de cada línea.
   • Guarda el archivo y recarga la página (Ctrl + F5).
================================================================= */

var FAWEB = {

    /* ---------- Datos de contacto ---------- */
    whatsapp: "573000000000",          // código de país + número, sin + ni espacios
    telefonoVisible: "+57 300 000 0000", // como se muestra en la página
    correo: "contacto@faweb.com",

    /* ---------- Categorías / productos ----------
       id y numero no se cambian (están ligados a producto-1.html … producto-4.html).
       exclusivo: true  → muestra la etiqueta "EXCLUSIVO" en la tarjeta.        */
    productos: [
        {
            id: 1,
            numero: "01",
            nombre: "Baja",
            precio: 30000,
            exclusivo: false,

            // Texto corto de la tarjeta (inicio y catálogo)
            resumen: "Opciones accesibles y sencillas, ideales para quienes buscan calidad a un precio cómodo.",

            // Texto largo de la página de la categoría
            descripcion: "Nuestra categoría Baja reúne opciones accesibles y sencillas para quienes quieren calidad sin gastar de más. Es el punto de partida perfecto para descubrir el estilo Faweb.",

            caracteristicas: [
                "Diseños sencillos y versátiles",
                "Materiales prácticos para el uso diario",
                "El precio más cómodo de la tienda",
                "Soporte por correo y WhatsApp"
            ],

            idealPara: "Uso diario y primeras compras",
            envio: "A todo Colombia",
            garantia: "30 días",

            // Imágenes: un enlace de internet o un archivo de la carpeta (ej: "img/media.jpg")
            imagen: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
            imagenTarjeta: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: 2,
            numero: "02",
            nombre: "Media",
            precio: 200000,
            exclusivo: false,

            // Texto corto de la tarjeta (inicio y catálogo)
            resumen: "Página web con lo esencial para mostrar tus productos y recibir los pedidos del carrito directamente, para que el administrador finalice la compra.",

            // Texto largo de la página de la categoría
            descripcion: "La categoría Media es una página web con lo esencial para mostrar tus productos y recibir los pedidos del carrito directamente, para que el administrador finalice la compra.",

            caracteristicas: [
                "Equilibrio entre diseño y precio",
                "Acabados más cuidados",
                "Gran variedad de estilos",
                "Garantía extendida de 60 días"
            ],

            idealPara: "El día a día y regalos",
            envio: "A todo Colombia",
            garantia: "60 días",

            // Imágenes: un enlace de internet o un archivo de la carpeta (ej: "img/media.jpg")
            imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
            imagenTarjeta: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: 3,
            numero: "03",
            nombre: "Alta",
            precio: 180000,
            exclusivo: false,

            // Texto corto de la tarjeta (inicio y catálogo)
            resumen: "Productos con diseños sofisticados y materiales seleccionados para una experiencia superior.",

            // Texto largo de la página de la categoría
            descripcion: "En la categoría Alta encontrarás diseños sofisticados y materiales seleccionados cuidadosamente, para una experiencia superior en cada detalle.",

            caracteristicas: [
                "Diseños sofisticados",
                "Materiales seleccionados de mayor calidad",
                "Presentación cuidada para regalo",
                "Garantía de 90 días"
            ],

            idealPara: "Ocasiones especiales",
            envio: "A todo Colombia",
            garantia: "90 días",

            // Imágenes: un enlace de internet o un archivo de la carpeta (ej: "img/media.jpg")
            imagen: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
            imagenTarjeta: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: 4,
            numero: "04",
            nombre: "Premium",
            precio: 350000,
            exclusivo: true,

            // Texto corto de la tarjeta (inicio y catálogo)
            resumen: "Nuestra selección más exclusiva, creada para quienes buscan elegancia, distinción y lujo.",

            // Texto largo de la página de la categoría
            descripcion: "Nuestra selección más exclusiva. La categoría Premium está creada para quienes buscan elegancia, distinción y lujo, con atención personalizada en cada pedido.",

            caracteristicas: [
                "Selección exclusiva y limitada",
                "Los mejores materiales y acabados",
                "Empaque de lujo incluido",
                "Atención personalizada y garantía de 1 año"
            ],

            idealPara: "Quienes buscan distinción",
            envio: "A todo Colombia, prioritario",
            garantia: "1 año",

            // Imágenes: un enlace de internet o un archivo de la carpeta (ej: "img/media.jpg")
            imagen: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
            imagenTarjeta: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80"
        }
    ]
};
