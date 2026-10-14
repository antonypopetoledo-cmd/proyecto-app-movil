import React from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";

export default function MisPublicacionesScreen({ sesion, navigation }) {
  const { pendientes, aprobados, rechazados, eliminarSolicitud } = useSolicitudes(sesion);
  const propias = [...pendientes, ...aprobados, ...rechazados]
    .filter((item) => item.creador === sesion?.email)
    .filter((item, index, lista) => lista.findIndex((otro) => otro.id === item.id) === index);
  const estado = (item) => item.estado === "aprobado" ? "Aprobado" : item.estado === "rechazado" ? "Rechazado" : "Pendiente de revisión";
  return <FlatList style={estilos.lista} data={propias} keyExtractor={(item) => item.id} ListHeaderComponent={<Text style={estilos.titulo}>Mis publicaciones</Text>} renderItem={({ item }) => <View style={estilos.card}>
    <Text style={estilos.nombre}>{item.titulo}</Text><Text>{item.fecha} · {item.categoria}</Text><Text style={item.estado === "rechazado" ? estilos.rechazado : estilos.estado}>{estado(item)}</Text>
    {item.motivoRechazo ? <Text style={estilos.motivo}>Motivo: {item.motivoRechazo}</Text> : null}
    {item.estado === "rechazado" ? <TouchableOpacity onPress={() => navigation.navigate("EditarSolicitud", { solicitud: item })}><Text style={estilos.enlace}>Editar y reenviar</Text></TouchableOpacity> : null}
    {item.estado === "pendiente" ? <TouchableOpacity onPress={() => Alert.alert("Cancelar solicitud", "¿Cancelar esta solicitud?", [{ text: "No" }, { text: "Cancelar", style: "destructive", onPress: () => eliminarSolicitud(item.id) }])}><Text style={estilos.rechazado}>Cancelar solicitud</Text></TouchableOpacity> : null}
    {item.estado === "aprobado" ? <TouchableOpacity onPress={() => navigation.navigate("DetalleEvento", { evento: item })}><Text style={estilos.enlace}>Ver detalles</Text></TouchableOpacity> : null}
  </View>} />;
}
const estilos = StyleSheet.create({ lista: { flex: 1, backgroundColor: "#F4F6FF", padding: 15 }, titulo: { fontSize: 25, fontWeight: "bold", marginVertical: 35 }, card: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 12 }, nombre: { fontWeight: "bold", fontSize: 17, marginBottom: 5 }, estado: { color: "#C47A00", fontWeight: "bold", marginTop: 8 }, rechazado: { color: "#D32F2F", fontWeight: "bold", marginTop: 8 }, motivo: { color: "#555", marginTop: 8 }, enlace: { color: "#5B4BDB", fontWeight: "bold", marginTop: 12 } });
