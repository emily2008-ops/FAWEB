
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

const { connectDB, getDb } = require('./db');
const productosRoutes = require('./rutas/productos');
const usuariosRoutes = require('./rutas/usuario');
const loginRoutes = require('./rutas/login');
const adminRoutes = require('./rutas/admin');

// Permitir que la página (Live Server) envíe la cookie de sesión
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5501'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Sesiones: recuerdan quién inició sesión
app.use(session({
    name: 'faweb.sid',
    secret: process.env.SESSION_SECRET || 'faweb-secreto-temporal',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8 // 8 horas
    }
}));

// Ruta básica de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor Express funcionando!');
});

// Rutas de productos
app.use('/', productosRoutes);
app.use('/', usuariosRoutes);
app.use('/login', loginRoutes);
app.use('/admin', adminRoutes);

// Datos de la tienda (WhatsApp, correo...) para el pie de página y el carrito
app.get('/configuracion', async (req, res) => {
    const guardada = await getDb().collection('configuracion').findOne({}) || {};

    res.json({
        nombreTienda: 'Faweb',
        correo: 'contacto@faweb.com',
        telefonoVisible: '+57 300 000 0000',
        ubicacion: 'Colombia',
        whatsapp: process.env.WHATSAPP || '',
        ...guardada
    });
});

// Iniciar servidor después de conectar MongoDB
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('No se pudo iniciar el servidor:', error);
        process.exit(1);
    });
