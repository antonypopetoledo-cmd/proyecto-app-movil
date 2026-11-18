import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const oyentes = new Set();
let sesionActual = null;

const normalizar = (email) => email.trim().toLowerCase();
const avisar = () => oyentes.forEach((fn) => fn());

export const suscribirSesion = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};

export const obtenerSesion = async () => sesionActual;

const traducirError = (e) => {
  switch (e.code) {
    case "auth/email-already-in-use":
      return { titulo: "Correo en uso", mensaje: "Ya existe una cuenta con ese correo." };
    case "auth/invalid-email":
      return { titulo: "Correo inválido", mensaje: "Ingresa un correo con formato válido." };
    case "auth/weak-password":
      return { titulo: "Contraseña débil", mensaje: "Usa al menos 8 caracteres con un número." };
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return { titulo: "Datos incorrectos", mensaje: "El correo o la contraseña no son correctos." };
    case "auth/too-many-requests":
      return { titulo: "Demasiados intentos", mensaje: "Espera unos minutos e inténtalo de nuevo." };
    case "auth/network-request-failed":
      return { titulo: "Sin conexión", mensaje: "Revisa tu conexión a internet." };
    default:
      return { titulo: "Error", mensaje: "No se pudo completar la acción. Intenta de nuevo." };
  }
};

// Combina el usuario de Auth con su perfil guardado en Firestore (usuarios/{uid})
const cargarSesion = async (user) => {
  const snap = await getDoc(doc(db, "usuarios", user.uid));
  const datos = snap.exists() ? snap.data() : {};
  const rol = datos.rol || "usuario";
  sesionActual = {
    uid: user.uid,
    email: user.email,
    nombre: datos.nombre || "",
    apellido: datos.apellido || "",
    rol,
    intereses: datos.intereses || [],
    // el administrador no pasa por la pantalla de intereses
    interesesListo: datos.interesesListo === true || rol === "administrador",
  };
  return sesionActual;
};

const esperarAuth = () =>
  auth.authStateReady
    ? auth.authStateReady()
    : new Promise((resolve) => {
        const quitar = onAuthStateChanged(auth, () => {
          quitar();
          resolve();
        });
      });

export const inicializarAuth = async () => {
  await esperarAuth();
  if (!auth.currentUser) {
    sesionActual = null;
    return null;
  }
  try {
    return await cargarSesion(auth.currentUser);
  } catch (e) {
    console.log("No se pudo recuperar la sesión:", e.message);
    sesionActual = null;
    return null;
  }
};

export const registrarUsuario = async ({ nombre, apellido, email, password }) => {
  try {
    const correo = normalizar(email);
    const cred = await createUserWithEmailAndPassword(auth, correo, password);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo,
      rol: "usuario",
      intereses: [],
      interesesListo: false,
      creadoEn: new Date().toISOString(),
    });
    const sesion = await cargarSesion(cred.user);
    avisar();
    return { ok: true, sesion };
  } catch (e) {
    return { ok: false, ...traducirError(e) };
  }
};

export const iniciarSesionConCuenta = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, normalizar(email), password);
    const sesion = await cargarSesion(cred.user);
    avisar();
    return { ok: true, sesion };
  } catch (e) {
    return { ok: false, ...traducirError(e) };
  }
};

export const cerrarSesion = async () => {
  await signOut(auth);
  sesionActual = null;
  avisar();
};

export const recuperarContrasena = async (email) => {
  try {
    await sendPasswordResetEmail(auth, normalizar(email));
    return { ok: true };
  } catch (e) {
    return { ok: false, ...traducirError(e) };
  }
};

// Actualiza campos del perfil: { nombre, apellido, intereses }
export const actualizarPerfil = async (cambios) => {
  try {
    if (!sesionActual) return { ok: false, mensaje: "No hay una sesión activa." };
    await setDoc(doc(db, "usuarios", sesionActual.uid), cambios, { merge: true });
    sesionActual = { ...sesionActual, ...cambios };
    avisar();
    return { ok: true };
  } catch (e) {
    return { ok: false, mensaje: "No se pudieron guardar los cambios." };
  }
};

// Guarda los intereses elegidos (o una lista vacía si el usuario omite)
export const guardarIntereses = (intereses) =>
  actualizarPerfil({ intereses, interesesListo: true });