const dosDigitos = (valor) => String(valor).padStart(2, "0");

const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export const crearFechaInicio = (fecha, hora) => {
  if (!(fecha instanceof Date) || !(hora instanceof Date)) return "";
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}T${dosDigitos(hora.getHours())}:${dosDigitos(hora.getMinutes())}:00-05:00`;
};

// Devuelve siempre formato limpio: "14 nov"
export const formatearFecha = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return "";
  const dia = fecha.getDate();
  const mes = MESES_CORTOS[fecha.getMonth()];
  return `${dia} ${mes}`;
};

// Convierte fechas viejas guardadas como "14/11/2026" a "14 nov" al mostrarlas
export const mostrarFechaCorta = (textoFecha) => {
  if (!textoFecha) return "";
  const match = String(textoFecha).trim().match(/^(\d{1,2})\/(\d{1,2})\/\d{2,4}$/);
  if (match) {
    const dia = Number(match[1]);
    const mesIndex = Number(match[2]) - 1;
    if (MESES_CORTOS[mesIndex]) {
      return `${dia} ${MESES_CORTOS[mesIndex]}`;
    }
  }
  return textoFecha;
};

export const formatearHora = (hora) => hora.toLocaleTimeString("es-PE", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export const fechaDesdeInicio = (fechaInicio) => {
  if (!fechaInicio) return new Date();
  const partes = String(fechaInicio).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (partes) {
    const [, anio, mes, dia, hora, minutos] = partes;
    return new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minutos));
  }
  const fecha = new Date(fechaInicio);
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
};
