import AsyncStorage from "@react-native-async-storage/async-storage";
import eventosLocal from "../data/eventos.json";

const API_URL = "https://raw.githubusercontent.com/antonypopetoledo-cmd/proyecto-app-movil/main/data/eventos.json";
const CLAVE_EDITADOS = "limago.eventos.editados";
const CLAVE_ELIMINADOS = "limago.eventos.eliminados";
const oyentes = new Set();

const avisar = () => oyentes.forEach((fn) => fn());
const esAdmin = (sesion) => sesion?.rol === "administrador";
const sinDuplicados = (eventos) => {
  const vistos = new Set();
  return eventos.filter((evento) => {
    const id = String(evento?.id || "");
    if (!id || vistos.has(id)) return false;
    vistos.add(id);
    return true;
  });
};
export const suscribirEventos = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };
export const getEliminados = async () => JSON.parse((await AsyncStorage.getItem(CLAVE_ELIMINADOS)) || "[]");
export const getEditados = async () => JSON.parse((await AsyncStorage.getItem(CLAVE_EDITADOS)) || "{}");
export const aplicarCambiosLocales = async (evento) => {
  const editados = await getEditados();
  return { ...evento, ...(editados[evento.id] || {}) };
};

export const getEventos = async () => {
  let eventos;
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`);
    eventos = res.ok ? await res.json() : eventosLocal;
  } catch (error) { eventos = eventosLocal; }
  const [editados, eliminados] = await Promise.all([getEditados(), getEliminados()]);
  return sinDuplicados(eventos.filter((evento) => !eliminados.includes(String(evento.id))).map((evento) => ({
    ...evento,
    ...(editados[evento.id] || {}),
  })));
};

export const editarEvento = async (id, datos, sesion) => {
  if (!esAdmin(sesion)) return { ok: false, mensaje: "No tienes permisos de administrador." };
  const editados = await getEditados();
  editados[id] = { ...datos, id: String(id) };
  await AsyncStorage.setItem(CLAVE_EDITADOS, JSON.stringify(editados));
  avisar();
  return { ok: true };
};

export const eliminarEvento = async (id, sesion) => {
  if (!esAdmin(sesion)) return { ok: false, mensaje: "No tienes permisos de administrador." };
  const eliminados = await getEliminados();
  if (!eliminados.includes(String(id))) eliminados.push(String(id));
  await AsyncStorage.setItem(CLAVE_ELIMINADOS, JSON.stringify(eliminados));
  avisar();
  return { ok: true };
};
