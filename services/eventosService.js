import eventosMock from "../data/eventos.json";

// Pon true para probar la pantalla de error
const SIMULAR_ERROR = false;

export const getEventos = async () => {
  // Simula demora de red
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (SIMULAR_ERROR) {
    throw new Error("No se pudo conectar con el servidor");
  }
  return eventosMock;
};

/* Cuando tengan API real, reemplaza todo por:
export const getEventos = async () => {
  const res = await fetch("https://TU_API/eventos");
  if (!res.ok) throw new Error("Error " + res.status);
  return await res.json();
};
*/