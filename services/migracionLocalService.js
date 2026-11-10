import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import eventosIniciales from "../data/eventos.json";

const CLAVE_MIGRACION = "limago.migracion.firestore.v1";
const migracionesEnCurso = new Map();
const CLAVE_IMPORTACION = "importaciones/eventos-iniciales";

const leer = async (clave, respaldo) => {
  const valor = await AsyncStorage.getItem(clave);
  return valor ? JSON.parse(valor) : respaldo;
};

const importarCatalogoInicial = async (sesion) => {
  if (sesion.rol !== "administrador") return;
  const marca = doc(db, CLAVE_IMPORTACION);
  if ((await getDoc(marca)).exists()) return;
  const lote = writeBatch(db);
  eventosIniciales.forEach(({ id, ...evento }) => {
    lote.set(doc(db, "eventos", String(id)), evento, { merge: false });
  });
  lote.set(marca, { cantidad: eventosIniciales.length, importadoEn: serverTimestamp() });
  await lote.commit();
};

const obtenerCreadorUid = async (creador, sesion) => {
  if (!creador) throw new Error("Hay una solicitud local sin correo de organizador.");
  if (creador?.toLowerCase() === sesion.email?.toLowerCase()) return sesion.uid;
  if (sesion.rol !== "administrador") return null;
  const usuarios = await getDocs(query(collection(db, "usuarios"), where("correo", "==", creador.toLowerCase())));
  if (usuarios.empty) throw new Error(`Falta registrar al organizador ${creador} antes de migrar sus solicitudes.`);
  return usuarios.docs[0].id;
};

const migrarSolicitud = async (solicitud, estado, sesion) => {
  if (!solicitud.id || solicitud.creador === "demo" || solicitud.id.startsWith("sol-demo-")) return;
  const creadorUid = await obtenerCreadorUid(solicitud.creador, sesion);
  if (!creadorUid) return;
  if (estado === "aprobado" && sesion.rol !== "administrador") {
    throw new Error("Un administrador debe migrar las solicitudes aprobadas desde este dispositivo.");
  }

  const { id, ...datos } = solicitud;
  const referencia = doc(db, "solicitudes", String(id));
  const eventoRef = doc(db, "eventos", String(id));
  await runTransaction(db, async (transaccion) => {
    const existente = await transaccion.get(referencia);
    const eventoExistente = estado === "aprobado" ? await transaccion.get(eventoRef) : null;
    const contenido = { ...datos, creadorUid, estado };
    if (!existente.exists()) transaccion.set(referencia, contenido);
    if (estado === "aprobado" && !eventoExistente.exists()) {
      const { motivoRechazo, ...evento } = contenido;
      transaccion.set(eventoRef, evento);
    }
  });
};

const ejecutarMigracion = async (sesion) => {
  const clave = `${CLAVE_MIGRACION}.${sesion.uid}`;
  if (await AsyncStorage.getItem(clave)) return;

  await importarCatalogoInicial(sesion);

  const [pendientes, aprobados, rechazados] = await Promise.all([
    leer("limago.solicitudes", []), leer("limago.aprobados", []), leer("limago.rechazados", []),
  ]);
  const erroresSolicitudes = [];
  for (const [lista, estado] of [[pendientes, "pendiente"], [aprobados, "aprobado"], [rechazados, "rechazado"]]) {
    for (const solicitud of lista) {
      try {
        await migrarSolicitud(solicitud, estado, sesion);
      } catch (error) {
        erroresSolicitudes.push(error.message);
      }
    }
  }

  if (sesion.rol === "administrador") {
    const editados = await leer("limago.eventos.editados", {});
    const eliminados = await leer("limago.eventos.eliminados", []);
    if (Object.keys(editados).length || eliminados.length) {
      const importacion = await getDoc(doc(db, "importaciones", "eventos-iniciales"));
      if (!importacion.exists()) return;
    }
    for (const [id, datos] of Object.entries(editados)) {
      if (eliminados.includes(String(id))) continue;
      const { id: _id, ...cambios } = datos;
      // El catálogo inicial debe estar importado antes de migrar las ediciones.
      await updateDoc(doc(db, "eventos", id), cambios);
    }
    for (const id of eliminados) {
      const referencia = doc(db, "eventos", String(id));
      await runTransaction(db, async (transaccion) => {
        const evento = await transaccion.get(referencia);
        if (evento.exists()) transaccion.delete(referencia);
      });
    }
  }

  await AsyncStorage.setItem(clave, "completada");
  if (erroresSolicitudes.length) {
    console.log("Algunas solicitudes locales no se migraron:", erroresSolicitudes);
  }
};

export const migrarDatosLocales = (sesion) => {
  if (!sesion?.uid) return Promise.resolve();
  if (!migracionesEnCurso.has(sesion.uid)) {
    const operacion = ejecutarMigracion(sesion).finally(() => migracionesEnCurso.delete(sesion.uid));
    migracionesEnCurso.set(sesion.uid, operacion);
  }
  return migracionesEnCurso.get(sesion.uid);
};
