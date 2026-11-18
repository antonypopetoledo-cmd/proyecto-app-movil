import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useEventos from "../hooks/useEventos";
import { calcularEstadisticas } from "../services/estadisticasService";
import { obtenerEstadisticasRecordatorios } from "../services/asistenciasService";

export default function EstadisticasScreen({ sesion }) {
  const { eventos, loading, error, reintentar } = useEventos(sesion);
  const { total, porCategoria, principal } = useMemo(() => calcularEstadisticas(eventos), [eventos]);
  const [statsRecordatorios, setStatsRecordatorios] = useState({
    totalRecordatorios: 0,
    eventoTopId: null,
    maxRecordatorios: 0,
  });

  useEffect(() => {
    obtenerEstadisticasRecordatorios()
      .then(setStatsRecordatorios)
      .catch(() => {});
  }, [eventos]);

  const eventoPopular = useMemo(() => {
    if (!statsRecordatorios.eventoTopId) return null;
    return eventos.find((e) => String(e.id) === String(statsRecordatorios.eventoTopId));
  }, [eventos, statsRecordatorios]);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>Estadísticas</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={estilos.centro} color="#5B4BDB" size="large" />
      ) : error ? (
        <View style={estilos.centro}>
          <Text>{error}</Text>
          <TouchableOpacity onPress={reintentar}>
            <Text style={estilos.enlace}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={estilos.lista}
          data={porCategoria}
          keyExtractor={(item) => item.categoria}
          ListHeaderComponent={
            <View style={estilos.resumen}>
              <Text style={estilos.dato}>Eventos publicados: {total}</Text>
              <Text style={estilos.dato}>
                Categoría con más eventos:{" "}
                {principal ? `${principal.categoria} (${principal.cantidad})` : "Ninguna"}
              </Text>
              <Text style={estilos.dato}>
                Recordatorios activados: {statsRecordatorios.totalRecordatorios}
              </Text>
              <Text style={estilos.dato}>
                Evento con más interés:{" "}
                {eventoPopular
                  ? `${eventoPopular.titulo} (${statsRecordatorios.maxRecordatorios})`
                  : "Ninguno todavía"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={estilos.vacio}>Todavía no hay eventos publicados.</Text>
          }
          renderItem={({ item }) => (
            <View style={estilos.fila}>
              <Text style={estilos.categoria}>{item.categoria}</Text>
              <Text style={estilos.cantidad}>{item.cantidad}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  cabecera: { backgroundColor: "#5B4BDB", padding: 20, paddingTop: 50 },
  titulo: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  centro: { flex: 1, justifyContent: "center", alignItems: "center" },
  lista: { padding: 16 },
  resumen: { backgroundColor: "#FFF", borderRadius: 12, padding: 18, marginBottom: 18, gap: 12 },
  dato: { color: "#222", fontSize: 17, fontWeight: "600" },
  fila: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoria: { flex: 1, color: "#333" },
  cantidad: { color: "#5B4BDB", fontWeight: "bold" },
  vacio: { textAlign: "center", color: "#666" },
  enlace: { color: "#5B4BDB", marginTop: 15, fontWeight: "bold" },
});
