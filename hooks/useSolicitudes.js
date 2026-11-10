import { useCallback, useEffect, useState } from "react";
import {
  aceptarSolicitud, eliminarSolicitud, enviarSolicitud, rechazarSolicitud,
  reenviarSolicitud, suscribirSolicitudes,
} from "../services/solicitudesService";

export default function useSolicitudes(sesion) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setLoading(true);
    setSolicitudes([]);
    return suscribirSolicitudes(
      sesion,
      (lista) => { setSolicitudes(lista); setError(null); setLoading(false); },
      () => { setError("No se pudieron cargar las solicitudes."); setLoading(false); },
    );
  }, [sesion?.uid, sesion?.rol, intento]);

  const ejecutar = useCallback(async (accion) => {
    try {
      setError(null);
      return await accion();
    } catch (e) {
      setError("No se pudo guardar el cambio. Revisa tu conexión e inténtalo otra vez.");
      throw e;
    }
  }, []);

  return {
    pendientes: solicitudes.filter((item) => item.estado === "pendiente"),
    aprobados: solicitudes.filter((item) => item.estado === "aprobado"),
    rechazados: solicitudes.filter((item) => item.estado === "rechazado"),
    loading,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
    enviarSolicitud: (datos) => ejecutar(() => enviarSolicitud(datos, sesion)),
    aceptarSolicitud: (id) => ejecutar(() => aceptarSolicitud(id, sesion)),
    rechazarSolicitud: (id, motivo) => ejecutar(() => rechazarSolicitud(id, motivo, sesion)),
    reenviarSolicitud: (id, datos) => ejecutar(() => reenviarSolicitud(id, datos, sesion)),
    eliminarSolicitud: (id) => ejecutar(() => eliminarSolicitud(id, sesion)),
  };
}
