import { useEffect, useState } from "react";
import {
  suscribir,
  getPendientes,
  getAprobados,
  getRechazados,
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  reenviarSolicitud,
  eliminarSolicitud,
} from "../services/solicitudesService";

export default function useSolicitudes(sesion) {
  const [pendientes, setPendientes] = useState([]);
  const [aprobados, setAprobados] = useState([]);
  const [rechazados, setRechazados] = useState([]);

  useEffect(() => {
    const sincronizar = async () => {
      setPendientes(await getPendientes()); setAprobados(await getAprobados()); setRechazados(await getRechazados());
    };
    sincronizar();
    return suscribir(sincronizar);
  }, [sesion]);

  return {
    pendientes,
    aprobados,
    rechazados,
    enviarSolicitud: (datos) => enviarSolicitud(datos, sesion),
    aceptarSolicitud: (id) => aceptarSolicitud(id, sesion),
    rechazarSolicitud: (id, motivo) => rechazarSolicitud(id, motivo, sesion),
    reenviarSolicitud: (id, datos) => reenviarSolicitud(id, datos, sesion),
    eliminarSolicitud: (id) => eliminarSolicitud(id, sesion),
  };
}
