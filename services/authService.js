import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_USUARIOS = "limago.usuarios";
const CLAVE_SESION = "limago.sesion";
const ADMINISTRADOR = { email: "admin@limago.com", password: "admin1234", rol: "administrador" };
const USUARIO_PRUEBA = { email: "jhon@gmail.com", password: "12345678", rol: "usuario" };
const oyentes = new Set();

const normalizar = (email) => email.trim().toLowerCase();
const avisar = () => oyentes.forEach((fn) => fn());

export { USUARIO_PRUEBA };
export const suscribirSesion = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };

export const inicializarAuth = async () => {
  const guardados = JSON.parse((await AsyncStorage.getItem(CLAVE_USUARIOS)) || "[]");
  const usuarios = [ADMINISTRADOR, USUARIO_PRUEBA, ...guardados];
  const unicos = usuarios.filter((u, i, lista) => lista.findIndex((x) => x.email === u.email) === i);
  await AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify(unicos));
  return JSON.parse((await AsyncStorage.getItem(CLAVE_SESION)) || "null");
};

export const registrarUsuario = async (email, password) => {
  const usuarios = JSON.parse((await AsyncStorage.getItem(CLAVE_USUARIOS)) || "[]");
  const correo = normalizar(email);
  if (usuarios.some((u) => u.email === correo)) return { ok: false, mensaje: "Ya existe una cuenta con ese correo." };
  await AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify([...usuarios, { email: correo, password, rol: "usuario" }]));
  return iniciarSesionConCuenta(correo, password);
};

export const iniciarSesionConCuenta = async (email, password) => {
  const usuarios = JSON.parse((await AsyncStorage.getItem(CLAVE_USUARIOS)) || "[]");
  const usuario = usuarios.find((u) => u.email === normalizar(email));
  if (!usuario) return { ok: false, titulo: "Cuenta inexistente", mensaje: "No existe una cuenta con ese correo. Crea una cuenta primero." };
  if (usuario.password !== password) return { ok: false, titulo: "Contraseña incorrecta", mensaje: "La contraseña no coincide con la de esta cuenta." };
  const sesion = { email: usuario.email, rol: usuario.rol };
  await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  avisar();
  return { ok: true, sesion };
};

export const cerrarSesion = async () => { await AsyncStorage.removeItem(CLAVE_SESION); avisar(); };
export const obtenerSesion = async () => JSON.parse((await AsyncStorage.getItem(CLAVE_SESION)) || "null");
