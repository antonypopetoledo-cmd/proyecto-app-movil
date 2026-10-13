import { useEffect, useState } from "react";
import {
  suscribir,
  getPendientes,
  getAprobados,
  enviarSolicitud,
  aceptarSolicitud,
  eliminarSolicitud,
} from "../services/solicitudesService";

export default function useSolicitudes() {
  const [pendientes, setPendientes] = useState(getPendientes());
  const [aprobados, setAprobados] = useState(getAprobados());

  useEffect(() => {
    const sincronizar = () => {
      setPendientes(getPendientes());
      setAprobados(getAprobados());
    };
    sincronizar();
    return suscribir(sincronizar);
  }, []);

  return {
    pendientes,
    aprobados,
    enviarSolicitud,
    aceptarSolicitud,
    eliminarSolicitud,
  };
}