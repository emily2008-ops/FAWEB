# Faweb

Proyecto web de Faweb con frontend HTML, CSS y JavaScript, y backend Node.js/Express conectado a MongoDB.

## Estructura

- `frontend/`: páginas, estilos CSS y scripts del sitio.
- `backend/`: servidor Express, rutas y conexión con MongoDB.

## Requisitos

- Node.js (versión LTS recomendada)
- npm
- Una base de datos MongoDB accesible
- Visual Studio Code (opcional)

## Configuración del backend

1. Abre una terminal dentro de `backend/`.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Copia `.env.example` como `.env`.
4. En `.env`, configura `MONGODB_URI` con la cadena de conexión de tu propia base de datos MongoDB, `SESSION_SECRET` con una frase secreta larga y `WHATSAPP` con el número correspondiente.
5. Inicia el servidor:

   ```bash
   npm start
   ```

El servidor utiliza el puerto `3000`.

## Abrir el frontend

Abre `frontend/index.html` mediante Live Server o un servidor estático local. El backend actual permite CORS para `localhost:5501` y `127.0.0.1:5501`; si utilizas otro origen o despliegas el proyecto, ajusta la configuración CORS de `backend/server.js` para ese dominio.

## Publicar en GitHub

Sube el contenido de esta carpeta al repositorio. No subas el archivo `.env`, credenciales, ni la carpeta `node_modules/`. Git los excluye mediante `.gitignore`.

**Importante:** configura las variables de entorno en el servicio donde despliegues el backend. GitHub Pages solo publica contenido estático; no ejecuta el backend Node.js ni aloja MongoDB.
