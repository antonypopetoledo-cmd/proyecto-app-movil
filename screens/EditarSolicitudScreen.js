import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";
const CAMPOS = ["titulo", "categoria", "fecha", "hora", "lugar", "precio", "organizador", "enlace", "imagen", "descripcion"];
export default function EditarSolicitudScreen({ route, navigation, sesion }) {
  const solicitud = route.params.solicitud; const { reenviarSolicitud } = useSolicitudes(sesion);
  const [form, setForm] = useState(Object.fromEntries(CAMPOS.map((campo) => [campo, solicitud[campo] || ""])));
  const guardar = async () => { if (!form.titulo.trim() || !form.categoria.trim() || !form.fecha.trim() || !form.lugar.trim()) return Alert.alert("Campos obligatorios", "Completa nombre, categoría, fecha y lugar."); const ok = await reenviarSolicitud(solicitud.id, form); if (ok) { Alert.alert("Solicitud reenviada", "Volverá a quedar pendiente de revisión.", [{ text: "Aceptar", onPress: () => navigation.goBack() }]); } };
  return <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.formulario}><Text style={estilos.titulo}>Corregir publicación</Text>{CAMPOS.map((campo) => <TextInput key={campo} style={estilos.input} placeholder={campo} value={String(form[campo])} onChangeText={(valor) => setForm({ ...form, [campo]: valor })} multiline={campo === "descripcion"} />)}<TouchableOpacity style={estilos.boton} onPress={guardar}><Text style={estilos.botonTexto}>Reenviar para aprobación</Text></TouchableOpacity></ScrollView>;
}
const estilos = StyleSheet.create({ contenedor: { flex: 1, backgroundColor: "#F4F6FF" }, formulario: { padding: 20, paddingTop: 50 }, titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 }, input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, marginBottom: 12 }, boton: { backgroundColor: "#5B4BDB", padding: 15, borderRadius: 10 }, botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold" } });
