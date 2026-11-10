import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";
import DateTimePicker from "@react-native-community/datetimepicker";
import { crearFechaInicio, fechaDesdeInicio, formatearFecha, formatearHora } from "../utils/fechaEvento";
const CAMPOS = ["titulo", "categoria", "fecha", "hora", "lugar", "precio", "organizador", "enlace", "imagen", "descripcion"];
export default function EditarSolicitudScreen({ route, navigation, sesion }) {
  const solicitud = route.params.solicitud; const { reenviarSolicitud } = useSolicitudes(sesion);
  const inicio = fechaDesdeInicio(solicitud.fechaInicio);
  const [form, setForm] = useState(Object.fromEntries(CAMPOS.map((campo) => [campo, solicitud[campo] || ""])),);
  const [fecha, setFecha] = useState(inicio);
  const [hora, setHora] = useState(inicio);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const cambiarFecha = (evento, valor) => {
    if (!valor) return;
    setFecha(valor);
    setForm((anterior) => ({ ...anterior, fecha: formatearFecha(valor), fechaInicio: crearFechaInicio(valor, hora) }));
    setMostrarFecha(false);
  };
  const cambiarHora = (evento, valor) => {
    if (!valor) return;
    setHora(valor);
    setForm((anterior) => ({ ...anterior, hora: formatearHora(valor), fechaInicio: crearFechaInicio(fecha, valor) }));
    setMostrarHora(false);
  };
  const guardar = async () => { if (!form.titulo.trim() || !form.categoria.trim() || !form.fecha.trim() || !form.hora.trim() || !form.lugar.trim()) return Alert.alert("Campos obligatorios", "Completa nombre, categoría, fecha, hora y lugar."); try { const ok = await reenviarSolicitud(solicitud.id, form); if (ok) { Alert.alert("Solicitud reenviada", "Volverá a quedar pendiente de revisión.", [{ text: "Aceptar", onPress: () => navigation.goBack() }]); } else Alert.alert("No disponible", "La solicitud ya no se puede reenviar."); } catch (e) { Alert.alert("Error", "No se pudo reenviar la solicitud."); } };
  return <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.formulario}><Text style={estilos.titulo}>Corregir publicación</Text>{CAMPOS.map((campo) => campo === "fecha" || campo === "hora" ? null : <TextInput key={campo} style={estilos.input} placeholder={campo} value={String(form[campo])} onChangeText={(valor) => setForm({ ...form, [campo]: valor })} multiline={campo === "descripcion"} />)}<Text style={estilos.etiqueta}>Fecha *</Text><TouchableOpacity style={estilos.input} onPress={() => setMostrarFecha(true)}><Text>{form.fecha || "Seleccionar fecha"}</Text></TouchableOpacity>{mostrarFecha ? <DateTimePicker value={fecha} mode="date" onValueChange={cambiarFecha} onDismiss={() => setMostrarFecha(false)} /> : null}<Text style={estilos.etiqueta}>Hora *</Text><TouchableOpacity style={estilos.input} onPress={() => setMostrarHora(true)}><Text>{form.hora || "Seleccionar hora"}</Text></TouchableOpacity>{mostrarHora ? <DateTimePicker value={hora} mode="time" display="clock" onValueChange={cambiarHora} onDismiss={() => setMostrarHora(false)} /> : null}<TouchableOpacity style={estilos.boton} onPress={guardar}><Text style={estilos.botonTexto}>Reenviar para aprobación</Text></TouchableOpacity></ScrollView>;
}
const estilos = StyleSheet.create({ contenedor: { flex: 1, backgroundColor: "#F4F6FF" }, formulario: { padding: 20, paddingTop: 50 }, titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 }, input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, marginBottom: 12 }, boton: { backgroundColor: "#5B4BDB", padding: 15, borderRadius: 10 }, botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold" } });
