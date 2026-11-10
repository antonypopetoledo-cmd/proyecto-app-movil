const dosDigitos = (valor) => String(valor).padStart(2, "0");

export const crearFechaInicio = (fecha, hora) => {
  if (!(fecha instanceof Date) || !(hora instanceof Date)) return "";
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}T${dosDigitos(hora.getHours())}:${dosDigitos(hora.getMinutes())}:00-05:00`;
};

export const formatearFecha = (fecha) => fecha.toLocaleDateString("es-PE");

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
