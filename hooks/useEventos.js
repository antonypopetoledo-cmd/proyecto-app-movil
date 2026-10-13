import { useState, useEffect, useMemo } from "react";
import { getEventos } from "../services/eventosService";
import useSolicitudes from "./useSolicitudes";

export default function useEventos() {
  const [eventosBase, setEventos] = useState([]);
  // Los eventos aceptados desde las solicitudes se muestran junto a los demás.
  const { aprobados } = useSolicitudes();
  const eventos = useMemo(
    () => [...aprobados, ...eventosBase],
    [aprobados, eventosBase]
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargar = async (esRefresh = false) => {
    try {
      esRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getEventos();
      setEventos(data);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los eventos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return {
    eventos,
    loading,
    refreshing,
    error,
    recargar: () => cargar(true),
    reintentar: () => cargar(false),
  };
}