import { collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const eventosRef = collection(db, "eventos");
const convertir = (documento) => ({ ...documento.data(), id: documento.id });
const esAdmin = (sesion) => sesion?.rol === "administrador";

export const getEventos = async () => (await getDocs(eventosRef)).docs.map(convertir);

export const suscribirEventos = (alCambiar, alError) =>
  onSnapshot(eventosRef, (resultado) => alCambiar(resultado.docs.map(convertir)), alError);

export const editarEvento = async (id, datos, sesion) => {
  if (!esAdmin(sesion)) return { ok: false, mensaje: "No tienes permisos de administrador." };
  try {
    const { id: _id, ...cambios } = datos;
    await updateDoc(doc(eventosRef, String(id)), cambios);
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: "No se pudo actualizar el evento. Intenta nuevamente." };
  }
};

export const eliminarEvento = async (id, sesion) => {
  if (!esAdmin(sesion)) return { ok: false, mensaje: "No tienes permisos de administrador." };
  try {
    await deleteDoc(doc(eventosRef, String(id)));
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: "No se pudo eliminar el evento. Intenta nuevamente." };
  }
};
