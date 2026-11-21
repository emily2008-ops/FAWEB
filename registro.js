
document.addEventListener('DOMContentLoaded', () => {

    const formulario = document.getElementById('form-registro');
    const alerta = document.getElementById('alerta-registro');

    const nombre = document.getElementById('reg-nombre');
    const correo = document.getElementById('reg-correo');
    const contrasena = document.getElementById('reg-contrasena');
    const confirmar = document.getElementById('reg-confirmar');

    const API_URL = 'http://localhost:3000/registro';

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        alerta.hidden = true;
        alerta.textContent = '';
        alerta.classList.remove('exito');

        const datos = {
            nombre: nombre.value.trim(),
            correo: correo.value.trim().toLowerCase(),
            password: contrasena.value
        };

        if (datos.nombre.length < 2) {
            mostrarMensaje('El nombre debe tener al menos 2 caracteres.');
            return;
        }

        if (!datos.correo) {
            mostrarMensaje('Ingresa tu correo electrónico.');
            return;
        }

        if (datos.password.length < 8) {
            mostrarMensaje('La contraseña debe tener mínimo 8 caracteres.');
            return;
        }

        if (!/[A-Za-z]/.test(datos.password) || !/[0-9]/.test(datos.password)) {
            mostrarMensaje('La contraseña debe contener letras y números.');
            return;
        }

        if (datos.password !== confirmar.value) {
            mostrarMensaje('Las contraseñas no coinciden.');
            return;
        }

        const boton = formulario.querySelector('button[type="submit"]');

        boton.disabled = true;
        boton.textContent = 'Registrando...';

        try {

            const respuesta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                mostrarMensaje(
                    resultado.mensaje || resultado.message || 'No se pudo crear la cuenta.'
                );
                return;
            }

            alerta.hidden = false;
            alerta.textContent = '¡Cuenta creada correctamente! Redirigiendo al inicio de sesión...';
            alerta.classList.add('exito');

            formulario.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {

            console.error('Error al registrar usuario:', error);

            mostrarMensaje('No se pudo conectar con el servidor. Verifica que esté funcionando.');

        } finally {

            boton.disabled = false;
            boton.textContent = 'Crear mi cuenta';

        }
    });

    function mostrarMensaje(mensaje) {
        alerta.hidden = false;
        alerta.textContent = mensaje;
        alerta.classList.remove('exito');
    }

});
