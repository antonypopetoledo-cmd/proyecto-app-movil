// Usuario de prueba: siempre existe y sirve para demostrar el ingreso.
export const USUARIO_PRUEBA = {
    email: "jhon@gmail.com",
    password: "12345678",
};

// Cuentas registradas desde "Crear cuenta" (se guardan mientras la app esté abierta).
const usuariosRegistrados = [USUARIO_PRUEBA];

const normalizar = (email) => email.trim().toLowerCase();

export const existeUsuario = (email) =>
    usuariosRegistrados.some((u) => u.email === normalizar(email));

export const registrarUsuario = (email, password) => {
    if (existeUsuario(email)) {
        return { ok: false, mensaje: "Ya existe una cuenta con ese correo." };
    }
    usuariosRegistrados.push({ email: normalizar(email), password });
    return { ok: true };
};

// Valida el inicio de sesión: rechaza cuentas inexistentes y contraseñas incorrectas.
export const iniciarSesionConCuenta = (email, password) => {
    const usuario = usuariosRegistrados.find(
        (u) => u.email === normalizar(email)
    );
    if (!usuario) {
        return {
            ok: false,
            titulo: "Cuenta inexistente",
            mensaje: "No existe una cuenta con ese correo. Crea una cuenta primero.",
        };
    }
    if (usuario.password !== password) {
        return {
            ok: false,
            titulo: "Contraseña incorrecta",
            mensaje: "La contraseña no coincide con la de esta cuenta.",
        };
    }
    return { ok: true };
};