import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_PENDIENTES = "limago.solicitudes";
const CLAVE_APROBADOS = "limago.aprobados";
const CLAVE_RECHAZADOS = "limago.rechazados";
const oyentes = new Set();
const avisar = () => oyentes.forEach((fn) => fn());
const guardar = async (clave, datos) => AsyncStorage.setItem(clave, JSON.stringify(datos));
const sinDuplicados = (datos) => {
  const vistos = new Set();
  return datos.filter((dato) => {
    const id = String(dato?.id || "");
    if (!id || vistos.has(id)) return false;
    vistos.add(id);
    return true;
  });
};

const SOLICITUDES_EJEMPLO = [
  { id: "sol-demo-1", titulo: "Noche de Teatro Peruano", categoria: "🎭 Teatro", fecha: "7 nov", hora: "7:30 p. m.", lugar: "Teatro Municipal de Lima, Cercado de Lima", precio: "Desde S/ 25", imagen: null, posicion: "center", descripcion: "Función con obras cortas de autores peruanos.", organizador: "Colectivo Escena Viva", enlace: null, creador: "demo" },
  { id: "sol-demo-2", titulo: "Feria Gastronómica Sabores de Lima", categoria: "🍔 Ferias gastronómicas", fecha: "14–15 nov", hora: "12:00 p. m. – 8:00 p. m.", lugar: "Parque de la Exposición, Cercado de Lima", precio: "Gratis", imagen: null, posicion: "center", descripcion: "Más de 40 stands de comida.", organizador: "Asociación de Cocineros de Lima", enlace: null, creador: "demo" },
];

export const inicializarSolicitudes = async () => {
  const pendientesGuardados = await AsyncStorage.getItem(CLAVE_PENDIENTES);
  const aprobadosGuardados = await AsyncStorage.getItem(CLAVE_APROBADOS);
  const rechazadosGuardados = await AsyncStorage.getItem(CLAVE_RECHAZADOS);
  await guardar(CLAVE_PENDIENTES, sinDuplicados(pendientesGuardados ? JSON.parse(pendientesGuardados) : SOLICITUDES_EJEMPLO));
  await guardar(CLAVE_APROBADOS, sinDuplicados(aprobadosGuardados ? JSON.parse(aprobadosGuardados) : []));
  await guardar(CLAVE_RECHAZADOS, sinDuplicados(rechazadosGuardados ? JSON.parse(rechazadosGuardados) : []));
};
export const suscribir = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };
export const getPendientes = async () => sinDuplicados(JSON.parse((await AsyncStorage.getItem(CLAVE_PENDIENTES)) || "[]")).map((item) => ({ ...item, estado: "pendiente" }));
export const getAprobados = async () => sinDuplicados(JSON.parse((await AsyncStorage.getItem(CLAVE_APROBADOS)) || "[]")).map((item) => ({ ...item, estado: "aprobado" }));
export const getRechazados = async () => sinDuplicados(JSON.parse((await AsyncStorage.getItem(CLAVE_RECHAZADOS)) || "[]")).map((item) => ({ ...item, estado: "rechazado" }));
const esAdmin = (sesion) => sesion?.rol === "administrador";

export const enviarSolicitud = async (datos, sesion) => {
  const pendientes = await getPendientes();
  const solicitud = { id: `sol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...datos, titulo: datos.titulo.trim(), creador: sesion.email, estado: "pendiente", motivoRechazo: null };
  await guardar(CLAVE_PENDIENTES, sinDuplicados([solicitud, ...pendientes])); avisar(); return solicitud;
};
export const eliminarSolicitud = async (id, sesion) => {
  const pendientes = await getPendientes();
  const solicitud = pendientes.find((item) => item.id === id);
  if (!solicitud || (solicitud.creador !== sesion?.email && !esAdmin(sesion))) return false;
  await guardar(CLAVE_PENDIENTES, pendientes.filter((item) => item.id !== id)); avisar(); return true;
};
export const aceptarSolicitud = async (id, sesion) => {
  if (!esAdmin(sesion)) return false;
  const pendientes = await getPendientes(); const solicitud = pendientes.find((item) => item.id === id); if (!solicitud) return false;
  await guardar(CLAVE_PENDIENTES, pendientes.filter((item) => item.id !== id));
  await guardar(CLAVE_APROBADOS, sinDuplicados([{ ...solicitud, estado: "aprobado" }, ...(await getAprobados())])); avisar(); return true;
};

export const rechazarSolicitud = async (id, motivo, sesion) => {
  if (!esAdmin(sesion) || !motivo.trim()) return false;
  const pendientes = await getPendientes();
  const solicitud = pendientes.find((item) => item.id === id);
  if (!solicitud) return false;
  const rechazada = { ...solicitud, estado: "rechazado", motivoRechazo: motivo.trim() };
  await guardar(CLAVE_PENDIENTES, pendientes.filter((item) => item.id !== id));
  await guardar(CLAVE_RECHAZADOS, sinDuplicados([rechazada, ...(await getRechazados())]));
  avisar(); return true;
};

export const reenviarSolicitud = async (id, datos, sesion) => {
  const rechazados = await getRechazados();
  const anterior = rechazados.find((item) => item.id === id);
  if (!anterior || anterior.creador !== sesion?.email) return false;
  const actualizada = { ...anterior, ...datos, id, creador: sesion.email, estado: "pendiente", motivoRechazo: anterior.motivoRechazo };
  await guardar(CLAVE_RECHAZADOS, rechazados.filter((item) => item.id !== id));
  await guardar(CLAVE_PENDIENTES, sinDuplicados([actualizada, ...(await getPendientes())]));
  avisar(); return true;
};
