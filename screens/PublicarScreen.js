import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import useSolicitudes from "../hooks/useSolicitudes";

const CAMPOS_VACIOS = {
  titulo: "",
  categoria: "",
  fecha: "",
  hora: "",
  lugar: "",
  precio: "",
  organizador: "",
  enlace: "",
  imagen: "",
  descripcion: "",
};

export default function PublicarScreen({ sesion, navigation }) {
  const { enviarSolicitud } = useSolicitudes(sesion);
  const [form, setForm] = useState(CAMPOS_VACIOS);
  const [error, setError] = useState("");
  const [mostrarPublicaciones, setMostrarPublicaciones] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const cambiar = (campo) => (texto) =>
    setForm((prev) => ({ ...prev, [campo]: texto }));

  const enviar = async () => {
    if (
      !form.titulo.trim() ||
      !form.categoria.trim() ||
      !form.fecha.trim() ||
      !form.lugar.trim()
    ) {
      setError("Nombre, categoría, fecha y lugar son obligatorios.");
      return;
    }
    if (form.enlace.trim() && !/^https?:\/\//i.test(form.enlace.trim())) {
      setError("El enlace debe empezar con http:// o https://");
      return;
    }
    if (form.imagen.trim() && !/^https?:\/\//i.test(form.imagen.trim())) {
      setError("La imagen debe ser un enlace que empiece con http:// o https://");
      return;
    }

    setError("");
    await enviarSolicitud(form);
    setForm(CAMPOS_VACIOS);
    Alert.alert(
      "Solicitud enviada",
      "Tu evento quedó pendiente de revisión. Si es aceptado, aparecerá en la pestaña Eventos."
    );
  };

  const campo = (etiqueta, clave, opciones = {}) => (
    <>
      <Text style={estilos.label}>{etiqueta}</Text>
      <TextInput
        style={[estilos.input, opciones.multilinea && estilos.inputMultilinea]}
        placeholder={opciones.placeholder}
        placeholderTextColor="#999"
        value={form[clave]}
        onChangeText={cambiar(clave)}
        autoCapitalize={opciones.autoCapitalize}
        keyboardType={opciones.keyboardType}
        multiline={opciones.multilinea}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={estilos.header}>
        <Text style={estilos.headerTitulo}>Publicar un evento</Text>
        <Text style={estilos.headerSubtitulo}>
          Envía tu solicitud y la revisaremos antes de publicarla
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={estilos.formulario}
        keyboardShouldPersistTaps="handled"
      >
        {campo("Nombre del evento *", "titulo", {
          placeholder: "Ej. Feria de Anime",
        })}
        {campo("Categoría *", "categoria", {
          placeholder: "Ej. 🍥 Anime",
        })}
        <>
          <Text style={estilos.label}>Fecha *</Text>
          <TouchableOpacity style={estilos.input} onPress={() => setMostrarCalendario(true)}><Text>{form.fecha || "Seleccionar fecha"}</Text></TouchableOpacity>
          {mostrarCalendario ? <DateTimePicker value={new Date()} mode="date" onValueChange={(evento, fecha) => { setMostrarCalendario(false); if (fecha) cambiar("fecha")(fecha.toLocaleDateString("es-PE")); }} /> : null}
        </>
        {campo("Hora", "hora", { placeholder: "Ej. 8:00 p. m." })}
        {campo("Lugar *", "lugar", {
          placeholder: "Ej. Costa 21, San Miguel",
        })}
        {campo("Precio", "precio", { placeholder: "Ej. Gratis, Desde S/ 20" })}
        {campo("Organizador", "organizador", {
          placeholder: "Ej. Live Nation Perú",
        })}
        {campo("Enlace oficial", "enlace", {
          placeholder: "https://...",
          autoCapitalize: "none",
          keyboardType: "url",
        })}
        {campo("Imagen (enlace)", "imagen", {
          placeholder: "https://...",
          autoCapitalize: "none",
          keyboardType: "url",
        })}
        {campo("Descripción", "descripcion", {
          placeholder: "Cuéntanos de qué trata el evento",
          multilinea: true,
        })}

        {error ? <Text style={estilos.error}>{error}</Text> : null}

        <TouchableOpacity
          style={estilos.boton}
          onPress={enviar}
          activeOpacity={0.8}
        >
          <Text style={estilos.botonTexto}>Enviar solicitud</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  header: { padding: 20, paddingTop: 50, backgroundColor: "#5B4BDB" },
  headerTitulo: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSubtitulo: { fontSize: 14, color: "#E0DDFF", marginTop: 4 },
  formulario: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
    color: "#222",
  },
  inputMultilinea: { minHeight: 90, textAlignVertical: "top" },
  error: { color: "#E53935", fontSize: 13, marginBottom: 10 },
  boton: {
    backgroundColor: "#5B4BDB",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 4,
  },
  botonTexto: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonSecundario: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#5B4BDB",
  },
  botonSecundarioTexto: { color: "#5B4BDB", fontWeight: "700" },
  misSolicitudes: { fontSize: 19, fontWeight: "bold", color: "#222", marginTop: 28, marginBottom: 10 },
  solicitudPropia: { backgroundColor: "#FFF", borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  solicitudTitulo: { flex: 1, color: "#333", fontWeight: "600" },
  cancelar: { color: "#E53935", fontWeight: "700", marginLeft: 10 },
  aprobado: { color: "#2E7D32", fontWeight: "700", marginLeft: 10 },
});
