document.addEventListener('DOMContentLoaded', () => {

    const formulario = document.getElementById('form-login');
    const alerta = document.getElementById('alerta-login');

    const correo = document.getElementById('login-correo');
    const contrasena = document.getElementById('login-contrasena');

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        alerta.hidden = true;
        alerta.textContent = '';
        alerta.classList.remove('exito');

        if (!correo.value.trim() || !contrasena.value) {
            mostrarMensaje('Escribe tu correo y tu contraseña.');
            return;
        }

        const boton = formulario.querySelector('button[type="submit"]');

        boton.disabled = true;
        boton.textContent = 'Ingresando...';

        try {

            const resultado = await Faweb.api('/login', {
                method: 'POST',
                body: {
                    correo: correo.value.trim().toLowerCase(),
                    password: contrasena.value
                }
            });

            alerta.hidden = false;
            alerta.textContent = '¡Bienvenido! Entrando...';
            alerta.classList.add('exito');

            // ¿A dónde ir después de entrar?
            const siguiente = Faweb.parametro('next');

            setTimeout(() => {
                if (siguiente && !siguiente.includes('//')) {
                    window.location.href = siguiente;      // ej: volver al carrito
                } else if (resultado.rol === 'admin') {
                    window.location.href = 'admin.html';   // admin → panel
                } else {
                    window.location.href = 'index.html';   // usuario → inicio
                }
            }, 800);

        } catch (error) {

            console.error('Error al iniciar sesión:', error);

            mostrarMensaje(
                error.status
                    ? error.message
                    : 'No se pudo conectar con el servidor. Verifica que esté funcionando.'
            );

            boton.disabled = false;
            boton.textContent = 'Ingresar';
        }
    });

    function mostrarMensaje(mensaje) {
        alerta.hidden = false;
        alerta.textContent = mensaje;
        alerta.classList.remove('exito');
    }

});
