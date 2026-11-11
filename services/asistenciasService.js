import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
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
    transaccion.set(asistenciaRef, { uid: String(uid), eventoId: String(eventoId), creadoEn: serverTimestamp() });
    return true;
  });
};
