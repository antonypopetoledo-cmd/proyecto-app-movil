import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// Contrato para Pope: devuelve true si se registró y false si ya existía.
export const registrarAsistencia = async (uid, eventoId) => {
  if (!uid || !eventoId) throw new Error("Falta identificar al usuario o el evento.");
  const eventoRef = doc(db, "eventos", String(eventoId));
  const asistenciaRef = doc(collection(eventoRef, "asistencias"), String(uid));
  return runTransaction(db, async (transaccion) => {
    const evento = await transaccion.get(eventoRef);
    if (!evento.exists()) throw new Error("El evento ya no está disponible.");
    const asistencia = await transaccion.get(asistenciaRef);
    if (asistencia.exists()) return false;
    transaccion.set(asistenciaRef, {
      uid: String(uid),
      eventoId: String(eventoId),
      creadoEn: serverTimestamp(),
    });
    return true;
  });
};

// Cuenta todos los recordatorios activados y detecta cuál es el evento con más interés
export const obtenerEstadisticasRecordatorios = async () => {
  const snapshot = await getDocs(collectionGroup(db, "asistencias"));
  const conteoPorEvento = {};

  snapshot.forEach((documento) => {
    const { eventoId } = documento.data();
    if (eventoId) {
      conteoPorEvento[eventoId] = (conteoPorEvento[eventoId] || 0) + 1;
    }
  });

  let eventoTopId = null;
  let maxRecordatorios = 0;

  Object.entries(conteoPorEvento).forEach(([id, cantidad]) => {
    if (cantidad > maxRecordatorios) {
      eventoTopId = id;
      maxRecordatorios = cantidad;
    }
  });

  return {
    totalRecordatorios: snapshot.size,
    eventoTopId,
    maxRecordatorios,
  };
};
