# Integración del asistente de IA en Faweb

## Qué se agregó
- Ruta `POST /asistente/chat` en el backend Express.
- Asistente flotante en las páginas públicas del frontend (el panel admin queda sin el chat).
- Consulta de hasta 25 productos activos de la colección `productos` de MongoDB, usando solo campos públicos.
- Límite básico de 12 mensajes por minuto por IP.
- La clave de Gemini y la cadena de MongoDB permanecen en variables de entorno del servidor.

## Paso 1. Seguridad de MongoDB
La versión ZIP original contenía una cadena de conexión con credenciales dentro de `backend/db.js`. Esa cadena se quitó del código. **Antes de ejecutar esta versión, cambia/revoca la contraseña de ese usuario en MongoDB Atlas** y actualiza la lista de IP permitidas de Atlas si corresponde.

## Paso 2. Configurar variables
Dentro de `backend`, copia `.env.example` como `.env` y completa:
- `MONGODB_URI`: cadena nueva de MongoDB Atlas.
- `MONGODB_DB_NAME`: `Faweb` (si ese es el nombre real de tu base de datos).
- `GEMINI_API_KEY`: clave creada en Google AI Studio.
- `GEMINI_MODEL`: modelo disponible en tu cuenta; por defecto `gemini-2.5-flash`.
- `SESSION_SECRET`: una frase larga y aleatoria.

Nunca compartas el archivo `.env`, no lo subas a Git y no pegues sus valores en el chat.

## Paso 3. Instalar y ejecutar
Requiere Node.js 18 o superior (se usa `fetch` nativo).

```bash
cd backend
npm install
npm start
```

El backend existente continúa escuchando en el puerto 3000. Para desarrollo local, abre el frontend con Live Server en el puerto 5501 como ya lo configuraste.

## Paso 4. Probar
1. Abre `http://127.0.0.1:5501/index.html`.
2. Pulsa el botón flotante ✦.
3. Pregunta por un producto que exista en la colección `productos`.
4. Si Gemini no está configurado, el asistente mostrará un aviso y el resto de Faweb seguirá funcionando.

## Notas
- No se modificaron las rutas existentes de productos, login, usuarios ni administración.
- No se escriben conversaciones en MongoDB; el historial se mantiene temporalmente en el navegador.
- Las recomendaciones se basan en los productos activos disponibles en la colección. No se consulta ni se comparte información personal de usuarios.
- En producción, configura el dominio permitido en CORS y sirve frontend/backend bajo una configuración HTTPS adecuada.


## Publicación en internet

El backend ahora sirve también la carpeta `frontend`, usa `process.env.PORT` y las llamadas del navegador son relativas al mismo dominio. Para publicar, sigue `../PUBLICAR_EN_RENDER.md` y configura las variables privadas en el panel del proveedor.
