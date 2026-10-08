import eventosLocal from "../data/eventos.json";

const API_URL =
  "https://raw.githubusercontent.com/antonypopetoledo-cmd/proyecto-app-movil/jay/data/eventos.json";
// Pon true para mostrar la pantalla de error en la exposición
const SIMULAR_ERROR = false;

export const getEventos = async () => {
  try {
    if (SIMULAR_ERROR) throw new Error("No se pudo conectar con el servidor");

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error " + res.status);
    return await res.json();
  } catch (e) {
    if (SIMULAR_ERROR) throw e;
    console.log("Falló la API, usando datos locales:", e.message);
    return eventosLocal;
  }
};