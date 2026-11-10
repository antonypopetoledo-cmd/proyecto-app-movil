import {
  collection, deleteDoc, doc, getDoc, onSnapshot, query,
  runTransaction, serverTimestamp, setDoc, updateDoc, where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const solicitudesRef = collection(db, "solicitudes");
const eventosRef = collection(db, "eventos");
const convertir = (documento) => ({ ...documento.data(), id: documento.id });
const esAdmin = (sesion) => sesion?.rol === "administrador";
const tieneSesion = (sesion) => Boolean(sesion?.uid);

export const suscribirSolicitudes = (sesion, alCambiar, alError) => {
  if (!tieneSesion(sesion)) return () => {};
  const consulta = esAdmin(sesion)
    ? query(solicitudesRef, where("estado", "==", "pendiente"))
    : query(solicitudesRef, where("creadorUid", "==", sesion.uid));
  return onSnapshot(consulta, (resultado) => alCambiar(resultado.docs.map(convertir)), alError);
};

export const enviarSolicitud = async (datos, sesion) => {
  if (!tieneSesion(sesion)) throw new Error("Debes iniciar sesión para publicar.");
  const referencia = doc(solicitudesRef);
  const admin = esAdmin(sesion);
  const solicitud = {
    ...datos,
    titulo: datos.titulo.trim(),
    creador: sesion.email,
    creadorUid: sesion.uid,
    estado: admin ? "aprobado" : "pendiente",
    motivoRechazo: null,
    creadoEn: serverTimestamp(),
  };
  if (admin) {
    await runTransaction(db, async (transaccion) => {
      transaccion.set(referencia, solicitud);
      transaccion.set(doc(eventosRef, referencia.id), { ...datos, titulo: solicitud.titulo, creadorUid: sesion.uid, creadoEn: serverTimestamp() });
    });
  } else {
    await setDoc(referencia, solicitud);
  }
  return { ...solicitud, id: referencia.id };
};

export const eliminarSolicitud = async (id, sesion) => {
  if (!tieneSesion(sesion)) return false;
  const referencia = doc(solicitudesRef, String(id));
  const solicitud = await getDoc(referencia);
  if (!solicitud.exists() || solicitud.data().estado !== "pendiente" ||
      (solicitud.data().creadorUid !== sesion.uid && !esAdmin(sesion))) return false;
  await deleteDoc(referencia);
  return true;
};

export const aceptarSolicitud = async (id, sesion) => {
  if (!esAdmin(sesion)) return false;
  const referencia = doc(solicitudesRef, String(id));
  return runTransaction(db, async (transaccion) => {
    const solicitud = await transaccion.get(referencia);
    if (!solicitud.exists() || solicitud.data().estado !== "pendiente") return false;
    const { estado, motivoRechazo, ...datos } = solicitud.data();
    transaccion.set(doc(eventosRef, String(id)), datos);
    transaccion.update(referencia, { estado: "aprobado", motivoRechazo: null });
    return true;
  });
};

export const rechazarSolicitud = async (id, motivo, sesion) => {
  if (!esAdmin(sesion) || !motivo?.trim()) return false;
  const referencia = doc(solicitudesRef, String(id));
  return runTransaction(db, async (transaccion) => {
    const solicitud = await transaccion.get(referencia);
    if (!solicitud.exists() || solicitud.data().estado !== "pendiente") return false;
    transaccion.update(referencia, { estado: "rechazado", motivoRechazo: motivo.trim() });
    return true;
  });
};

export const reenviarSolicitud = async (id, datos, sesion) => {
  if (!tieneSesion(sesion)) return false;
  const referencia = doc(solicitudesRef, String(id));
  const solicitud = await getDoc(referencia);
  if (!solicitud.exists() || solicitud.data().estado !== "rechazado" || solicitud.data().creadorUid !== sesion.uid) return false;
  const { id: _id, creador: _creador, creadorUid: _uid, estado: _estado, ...cambios } = datos;
  await updateDoc(referencia, { ...cambios, estado: "pendiente", motivoRechazo: null });
  return true;
};
