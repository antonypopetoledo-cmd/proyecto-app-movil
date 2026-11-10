import { readFile } from "node:fs/promises";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Ejecutar solo desde un equipo autorizado, nunca desde la aplicación móvil.
// $env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\privada\cuenta-servicio.json"
// $env:FIREBASE_PROJECT_ID="lima-go-b561c"
// npm run importar:eventos

const proyecto = process.env.FIREBASE_PROJECT_ID;
if (!proyecto) throw new Error("Define FIREBASE_PROJECT_ID antes de importar eventos.");

const ruta = new URL("../data/eventos.json", import.meta.url);
const eventos = JSON.parse(await readFile(ruta, "utf8"));
if (!Array.isArray(eventos) || eventos.some((evento) =>
  !evento.id || !evento.fechaInicio || Number.isNaN(Date.parse(evento.fechaInicio)))) {
  throw new Error("Todos los eventos de data/eventos.json necesitan id y fechaInicio válido antes de importarse.");
}
if (new Set(eventos.map((evento) => String(evento.id))).size !== eventos.length) {
  throw new Error("Hay identificadores de eventos duplicados en data/eventos.json.");
}

initializeApp({ credential: applicationDefault(), projectId: proyecto });
const baseDatos = getFirestore();
const marca = baseDatos.doc("importaciones/eventos-iniciales");
if ((await marca.get()).exists) {
  console.log("La importación inicial ya se completó; no se sobrescribieron eventos.");
  process.exit(0);
}

let importados = 0;
for (const evento of eventos) {
  const { id, ...datos } = evento;
  const referencia = baseDatos.doc(`eventos/${id}`);
  try {
    await referencia.create(datos);
    importados++;
  } catch (error) {
    if (error.code !== 6 && error.code !== "already-exists") throw error;
  }
}
await marca.create({ cantidad: eventos.length, importadoEn: new Date() });
console.log(`Importación completa: ${importados} eventos nuevos de ${eventos.length}.`);
