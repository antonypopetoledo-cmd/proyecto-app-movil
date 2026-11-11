import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { editarEvento } from "../services/eventosService";
import DateTimePicker from "@react-native-community/datetimepicker";
import { crearFechaInicio, fechaDesdeInicio, formatearFecha, formatearHora } from "../utils/fechaEvento";

const CAMPOS = ["titulo", "categoria", "lugar", "precio", "organizador", "enlace", "imagen", "descripcion"];

export default function EditarEventoScreen({ route, navigation, sesion }) {
  const evento = route.params.evento;
  const inicio = fechaDesdeInicio(evento.fechaInicio);
  const [form, setForm] = useState({
    ...Object.fromEntries(CAMPOS.map((campo) => [campo, evento[campo] || ""])),
    fecha: evento.fecha || "",
    hora: evento.hora || "",
    fechaInicio: evento.fechaInicio || "",
  });
  const [fecha, setFecha] = useState(inicio);
  const [hora, setHora] = useState(inicio);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const cambiar = (campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }));
  const guardar = async () => {
    if (!form.titulo.trim() || !form.categoria.trim() || !form.fecha.trim() || !form.hora.trim() || !form.lugar.trim()) return Alert.alert("Campos obligatorios", "Completa nombre, categoría, fecha, hora y lugar.");
    const resultado = await editarEvento(evento.id, { ...form, fecha: form.fecha, hora: form.hora, fechaInicio: form.fechaInicio }, sesion);
    if (!resultado.ok) return Alert.alert("No se pudo guardar", resultado.mensaje);
    Alert.alert("Evento actualizado", "Los cambios ya aparecen en el catálogo.", [{ text: "Aceptar", onPress: () => navigation.goBack() }]);
  };
  return <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.formulario}>
    <Text style={estilos.titulo}>Editar evento</Text>
    {CAMPOS.map((campo) => <View key={campo}><Text style={estilos.etiqueta}>{campo}</Text><TextInput style={estilos.input} value={String(form[campo])} onChangeText={(valor) => cambiar(campo, valor)} multiline={campo === "descripcion"} /></View>)}
    <Text style={estilos.etiqueta}>Fecha *</Text><TouchableOpacity style={estilos.input} onPress={() => setMostrarFecha(true)}><Text>{form.fecha || "Seleccionar fecha"}</Text></TouchableOpacity>{mostrarFecha ? <DateTimePicker value={fecha} mode="date" onValueChange={(eventoCambio, valor) => { if (!valor) return; setFecha(valor); setForm((anterior) => ({ ...anterior, fecha: formatearFecha(valor), fechaInicio: crearFechaInicio(valor, hora) })); setMostrarFecha(false); }} onDismiss={() => setMostrarFecha(false)} /> : null}
    <Text style={estilos.etiqueta}>Hora *</Text><TouchableOpacity style={estilos.input} onPress={() => setMostrarHora(true)}><Text>{form.hora || "Seleccionar hora"}</Text></TouchableOpacity>{mostrarHora ? <DateTimePicker value={hora} mode="time" display="clock" onValueChange={(eventoCambio, valor) => { if (!valor) return; setHora(valor); setForm((anterior) => ({ ...anterior, hora: formatearHora(valor), fechaInicio: crearFechaInicio(fecha, valor) })); setMostrarHora(false); }} onDismiss={() => setMostrarHora(false)} /> : null}
    <TouchableOpacity style={estilos.boton} onPress={guardar}><Text style={estilos.botonTexto}>Guardar cambios</Text></TouchableOpacity>
  </ScrollView>;
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" }, formulario: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  titulo: { fontSize: 25, fontWeight: "bold", color: "#222", marginBottom: 20 }, etiqueta: { textTransform: "capitalize", fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, marginBottom: 14 },
  boton: { backgroundColor: "#5B4BDB", padding: 15, borderRadius: 10, marginTop: 8 }, botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
});
