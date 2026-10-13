import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";

function SolicitudCard({ solicitud, onAceptar, onEliminar }) {
  return (
    <View style={estilos.card}>
      <Text style={estilos.categoria}>{solicitud.categoria}</Text>
      <Text style={estilos.titulo}>{solicitud.titulo}</Text>
      <Text style={estilos.detalle}>
        📅 {solicitud.fecha}
        {solicitud.hora ? ` · ${solicitud.hora}` : ""}
      </Text>
      <Text style={estilos.detalle}>📍 {solicitud.lugar}</Text>
      <Text style={estilos.detalle}>💲 {solicitud.precio}</Text>
      {solicitud.organizador ? (
        <Text style={estilos.detalle}>🎤 {solicitud.organizador}</Text>
      ) : null}
      {solicitud.descripcion ? (
        <Text style={estilos.descripcion}>{solicitud.descripcion}</Text>
      ) : null}

      <View style={estilos.acciones}>
        <TouchableOpacity
          style={[estilos.accion, estilos.eliminar]}
          onPress={onEliminar}
          activeOpacity={0.8}
        >
          <Text style={estilos.eliminarTexto}>Eliminar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.accion, estilos.aceptar]}
          onPress={onAceptar}
          activeOpacity={0.8}
        >
          <Text style={estilos.aceptarTexto}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SolicitudesScreen() {
  const { pendientes, aceptarSolicitud, eliminarSolicitud } = useSolicitudes();

  const aceptar = (solicitud) => {
    aceptarSolicitud(solicitud.id);
    Alert.alert(
      "Solicitud aceptada",
      `"${solicitud.titulo}" ya aparece en la pestaña Eventos.`
    );
  };

  const eliminar = (solicitud) => {
    Alert.alert(
      "Eliminar solicitud",
      `¿Eliminar "${solicitud.titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarSolicitud(solicitud.id),
        },
      ]
    );
  };

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.header}>
        <Text style={estilos.headerTitulo}>Solicitudes</Text>
        <Text style={estilos.headerSubtitulo}>
          {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""} de
          revisión
        </Text>
      </View>

      <FlatList
        data={pendientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SolicitudCard
            solicitud={item}
            onAceptar={() => aceptar(item)}
            onEliminar={() => eliminar(item)}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <Text style={estilos.vacio}>No hay solicitudes pendientes</Text>
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  header: { padding: 20, paddingTop: 50, backgroundColor: "#5B4BDB" },
  headerTitulo: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSubtitulo: { fontSize: 14, color: "#E0DDFF", marginTop: 4 },
  lista: { padding: 15 },
  vacio: { textAlign: "center", color: "#777", marginTop: 30 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoria: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4BDB",
    marginBottom: 4,
  },
  titulo: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 6 },
  detalle: { fontSize: 13, color: "#555", marginTop: 2 },
  descripcion: { fontSize: 13, color: "#777", marginTop: 8, lineHeight: 18 },
  acciones: { flexDirection: "row", gap: 10, marginTop: 14 },
  accion: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  eliminar: { borderWidth: 1.5, borderColor: "#E53935", backgroundColor: "#FFF" },
  eliminarTexto: { color: "#E53935", fontWeight: "700" },
  aceptar: { backgroundColor: "#2E7D32" },
  aceptarTexto: { color: "#FFF", fontWeight: "700" },
});