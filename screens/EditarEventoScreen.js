import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { editarEvento } from "../services/eventosService";

const CAMPOS = ["titulo", "categoria", "fecha", "hora", "lugar", "precio", "organizador", "enlace", "imagen", "descripcion"];

export default function EditarEventoScreen({ route, navigation, sesion }) {
  const [form, setForm] = useState(Object.fromEntries(CAMPOS.map((campo) => [campo, route.params.evento[campo] || ""])));
  const cambiar = (campo, valor) => setForm((anterior) => ({ ...anterior, [campo]: valor }));
  const guardar = async () => {
    const resultado = await editarEvento(route.params.evento.id, form, sesion);
    if (!resultado.ok) return Alert.alert("Acceso denegado", resultado.mensaje);
    Alert.alert("Evento actualizado", "Los cambios ya aparecen en el catálogo.", [{ text: "Aceptar", onPress: () => navigation.goBack() }]);
  };
  return <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.formulario}>
    <Text style={estilos.titulo}>Editar evento</Text>
    {CAMPOS.map((campo) => <View key={campo}><Text style={estilos.etiqueta}>{campo}</Text><TextInput style={estilos.input} value={String(form[campo])} onChangeText={(valor) => cambiar(campo, valor)} multiline={campo === "descripcion"} /></View>)}
    <TouchableOpacity style={estilos.boton} onPress={guardar}><Text style={estilos.botonTexto}>Guardar cambios</Text></TouchableOpacity>
  </ScrollView>;
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" }, formulario: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  titulo: { fontSize: 25, fontWeight: "bold", color: "#222", marginBottom: 20 }, etiqueta: { textTransform: "capitalize", fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 12, marginBottom: 14 },
  boton: { backgroundColor: "#5B4BDB", padding: 15, borderRadius: 10, marginTop: 8 }, botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
});
