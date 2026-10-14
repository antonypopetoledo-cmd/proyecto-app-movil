import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";

function SolicitudCard({ solicitud, onAceptar, onEliminar, onVerDetalle }) {
  return (
    <TouchableOpacity style={estilos.card} onPress={onVerDetalle} activeOpacity={0.9}>
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
      {solicitud.motivoRechazo ? <Text style={estilos.motivo}>Antecedente: {solicitud.motivoRechazo}</Text> : null}

      <View style={estilos.acciones}>
        <TouchableOpacity
          style={[estilos.accion, estilos.eliminar]}
          onPress={onEliminar}
          activeOpacity={0.8}
        >
          <Text style={estilos.eliminarTexto}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.accion, estilos.aceptar]}
          onPress={onAceptar}
          activeOpacity={0.8}
        >
          <Text style={estilos.aceptarTexto}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function SolicitudesScreen({ sesion, navigation }) {
  const { pendientes, aceptarSolicitud, rechazarSolicitud } = useSolicitudes(sesion);
  const [solicitudRechazo, setSolicitudRechazo] = React.useState(null);
  const [motivo, setMotivo] = React.useState("");

  const aceptar = (solicitud) => {
    aceptarSolicitud(solicitud.id);
    Alert.alert(
      "Solicitud aceptada",
      `"${solicitud.titulo}" ya aparece en la pestaña Eventos.`
    );
  };

  const eliminar = (solicitud) => {
    setMotivo(""); setSolicitudRechazo(solicitud);
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
            onVerDetalle={() => navigation.navigate("DetalleEvento", { evento: item, esSolicitud: true })}
          />
        )}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <Text style={estilos.vacio}>No hay solicitudes pendientes</Text>
        }
      />
      <Modal visible={!!solicitudRechazo} transparent animationType="fade">
        <View style={estilos.modalFondo}><View style={estilos.modal}>
          <Text style={estilos.modalTitulo}>Motivo del rechazo</Text>
          <Text style={estilos.modalAyuda}>Indica al usuario qué debe corregir.</Text>
          <TextInput style={estilos.modalInput} value={motivo} onChangeText={setMotivo} multiline placeholder="Escribe el motivo" />
          <View style={estilos.modalAcciones}>
            <TouchableOpacity style={estilos.modalCancelar} onPress={() => setSolicitudRechazo(null)}><Text style={estilos.modalCancelarTexto}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={estilos.modalRechazar} onPress={async () => { if (!motivo.trim()) return Alert.alert("Motivo obligatorio", "Escribe un motivo."); const resultado = await rechazarSolicitud(solicitudRechazo.id, motivo); if (resultado !== false) { setSolicitudRechazo(null); Alert.alert("Solicitud rechazada", "El usuario podrá ver el motivo y corregir su publicación."); } }}><Text style={estilos.modalRechazarTexto}>Confirmar rechazo</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>
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
  motivo: { fontSize: 13, color: "#C47A00", marginTop: 8 },
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
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "#FFF", borderRadius: 14, padding: 20 }, modalTitulo: { fontSize: 20, fontWeight: "bold" }, modalAyuda: { color: "#666", marginVertical: 8 },
  modalInput: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, minHeight: 90, padding: 12, textAlignVertical: "top" }, modalAcciones: { flexDirection: "row", justifyContent: "flex-end", gap: 24, marginTop: 16 },
  modalCancelar: { paddingVertical: 12, paddingHorizontal: 14 },
  modalCancelarTexto: { color: "#555", fontWeight: "600" },
  modalRechazar: { backgroundColor: "#D32F2F", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14 },
  modalRechazarTexto: { color: "#FFF", fontWeight: "700" },
});
