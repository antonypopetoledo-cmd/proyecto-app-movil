import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const favoritosDe = (uid) => collection(db, "usuarios", uid, "favoritos");

export const suscribirFavoritos = (uid, alCambiar, alError) =>
  onSnapshot(favoritosDe(uid), (resultado) => alCambiar(resultado.docs.map((item) => item.id)), alError);

export const guardarFavorito = async (uid, eventoId, favorito) => {
  if (!uid || !eventoId) throw new Error("Falta identificar al usuario o el evento.");
  const referencia = doc(favoritosDe(uid), String(eventoId));
  if (favorito) {
    await setDoc(referencia, { eventoId: String(eventoId) });
  } else {
    await deleteDoc(referencia);
  }
};
