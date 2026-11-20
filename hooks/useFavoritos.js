import { useEffect, useState } from "react";
import { guardarFavorito, suscribirFavoritos } from "../services/favoritosService";
import { notificarFavorito } from "../services/notificacionesService";

export default function useFavoritos(uid) {
  const [favoritos, setFavoritos] = useState([]);
  const [errorFavoritos, setErrorFavoritos] = useState(null);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    setFavoritos([]);
    setCargandoFavoritos(true);
    if (!uid) { setCargandoFavoritos(false); return; }
    return suscribirFavoritos(
      uid,
      (ids) => { setFavoritos(ids); setErrorFavoritos(null); setCargandoFavoritos(false); },
      () => { setErrorFavoritos("No se pudieron cargar los favoritos."); setCargandoFavoritos(false); },
    );
  }, [uid, intento]);

  const alternarFavorito = async (id, tituloEvento) => {
    if (cargandoFavoritos || errorFavoritos) throw new Error("Espera a que carguen tus favoritos.");
    const seAñade = !favoritos.includes(id);
    try {
      await guardarFavorito(uid, id, seAñade);
      setErrorFavoritos(null);
      if (seAñade) await notificarFavorito(tituloEvento);
    } catch (e) {
      setErrorFavoritos("No se pudo guardar el favorito. Intenta nuevamente.");
      throw e;
    }
  };

  return { favoritos, cargandoFavoritos, errorFavoritos, alternarFavorito, reintentarFavoritos: () => setIntento((actual) => actual + 1) };
}
