import { useState, useEffect, useMemo } from "react";
import { getEventos, suscribirEventos, getEliminados, aplicarCambiosLocales } from "../services/eventosService";
import useSolicitudes from "./useSolicitudes";

export default function useEventos(sesion) {
  const [eventosBase, setEventos] = useState([]);
  // Los eventos aceptados desde las solicitudes se muestran junto a los demás.
  const { aprobados } = useSolicitudes(sesion);
  const eventos = useMemo(() => eventosBase, [eventosBase]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargar = async (esRefresh = false) => {
    try {
      esRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getEventos();
      const eliminados = await getEliminados();
      const aprobadosLocales = await Promise.all(aprobados.map(aplicarCambiosLocales));
      setEventos([...aprobadosLocales, ...data].filter((evento) => !eliminados.includes(String(evento.id))));
    } catch (e) {
      setError(e.message || "No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargar();
    return suscribirEventos(() => cargar(true));
  }, [aprobados]);

  return {
    eventos,
    loading,
    refreshing,
    error,
    recargar: () => cargar(true),
    reintentar: () => cargar(false),
  };
}
