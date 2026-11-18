import { collection, deleteDoc, doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const eventosRef = collection(db, "eventos");
const esAdmin = (sesion) => sesion?.rol === "administrador";

const convertir = (documento) => ({ ...documento.data(), id: documento.id });

// Convierte cualquier formato de fecha (Timestamp de Firestore, texto ISO o Date) a milisegundos
const obtenerTiempo = (fecha) => {
  if (!fecha) return Infinity;
  if (typeof fecha.toMillis === "function") return fecha.toMillis();
  const tiempo = new Date(fecha).getTime();
  return Number.isNaN(tiempo) ? Infinity : tiempo;
};

// Ordena los eventos por fechaInicio (más próximos primero) sin ocultar ninguno si le falta la fecha
const ordenarPorFecha = (lista) => {
  const ahora = Date.now();
  return [...lista].sort((a, b) => {
    const tiempoA = obtenerTiempo(a.fechaInicio);
    const tiempoB = obtenerTiempo(b.fechaInicio);
    const aPaso = tiempoA < ahora;
    const bPaso = tiempoB < ahora;

    // Pone siempre los eventos futuros antes que los eventos ya pasados
    if (!aPaso && bPaso) return -1;
    if (aPaso && !bPaso) return 1;
    return tiempoA - tiempoB;
  });
};


export const getEventos = async () => {
  const snapshot = await getDocs(eventosRef);
  return ordenarPorFecha(snapshot.docs.map(convertir));
};

export const suscribirEventos = (alCambiar, alError) =>
  onSnapshot(
    eventosRef,
    (resultado) => alCambiar(ordenarPorFecha(resultado.docs.map(convertir))),
    alError
  );

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
