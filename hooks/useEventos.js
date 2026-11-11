import { useCallback, useEffect, useState } from "react";
import { getEventos, suscribirEventos } from "../services/eventosService";

export default function useEventos(sesion) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  const recargar = useCallback(async () => {
    setRefreshing(true);
    try {
      setEventos(await getEventos());
      setError(null);
    } catch (e) {
      setError("No se pudieron cargar los eventos. Revisa tu conexión.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setEventos([]);
    return suscribirEventos(
      (lista) => { setEventos(lista); setError(null); setLoading(false); },
      () => { setError("No se pudieron cargar los eventos. Revisa tu conexión."); setLoading(false); },
    );
  }, [sesion?.uid, intento]);

  return { eventos, loading, refreshing, error, recargar, reintentar: () => setIntento((actual) => actual + 1) };
}
