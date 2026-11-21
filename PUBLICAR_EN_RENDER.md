# Publicar Faweb en Render

Esta versión sirve el frontend y el backend Node.js desde el mismo servicio para que las rutas de la API funcionen en internet sin direcciones localhost. Se conserva MongoDB Atlas como base de datos.

## Antes de publicar

1. Cambia la contraseña del usuario de MongoDB Atlas que estaba incluida en el ZIP original.
2. En MongoDB Atlas, agrega el acceso de red necesario para Render. Para una primera prueba puedes usar `0.0.0.0/0` solo si la contraseña es nueva, robusta y el usuario tiene permisos mínimos; para producción es preferible restringir por IP cuando sea posible.
3. Crea una clave de Gemini en Google AI Studio. No la pongas en archivos del frontend.
4. Sube esta carpeta a un repositorio Git privado o público sin incluir `.env`, contraseñas ni claves.

## Despliegue

1. Crea una cuenta en https://render.com/ y conecta el repositorio Git.
2. En Render, selecciona **New + → Blueprint** y elige el repositorio que contiene `render.yaml`.
3. Render leerá `render.yaml`. Completa las variables solicitadas `MONGODB_URI`, `GEMINI_API_KEY` y `WHATSAPP` en el panel de Render. `SESSION_SECRET` se genera automáticamente.
4. Confirma la creación del servicio y espera el despliegue. Render mostrará una dirección HTTPS `*.onrender.com`.
5. Abre esa dirección y prueba inicio de sesión, catálogo, carrito, administración y asistente.

## Importante

- No incluyas el archivo `.env` ni claves privadas en Git.
- El plan gratuito de un proveedor puede tener suspensión por inactividad, límites o cambios de disponibilidad. Revisa las condiciones actuales antes de usarlo para una tienda real.
- No se puede publicar en una cuenta de hosting sin que el propietario cree la cuenta, autorice el repositorio y configure los secretos.
- El asistente usa la colección `productos` y consulta solo campos públicos de productos activos. Verifica que los documentos de tu catálogo usen esos nombres de campos.
