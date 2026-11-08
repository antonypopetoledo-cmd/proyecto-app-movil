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
import { INTERESES } from "../data/categorias";

const CAMPOS_VACIOS = {
  titulo: "",
  categoria: "",
  fecha: "",
  fechaInicio: "",
  hora: "",
  lugar: "",
  precio: "",
  organizador: "",
  enlace: "",
  imagen: "",
  descripcion: "",
};

// Fecha real en el mismo formato que eventos.json: 2026-11-20T12:00:00
const aFechaISO = (f) => {
  const dos = (n) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}T12:00:00`;
};

export default function PublicarScreen({ sesion, navigation }) {
  const { enviarSolicitud } = useSolicitudes(sesion);
  const [form, setForm] = useState(CAMPOS_VACIOS);
  const [error, setError] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());

  const esAdmin = sesion?.rol === "administrador";

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
      esAdmin ? "Evento publicado" : "Solicitud enviada",
      esAdmin
        ? "Tu evento ya aparece en la pestaña Eventos."
        : "Tu evento quedó pendiente de revisión. Si es aceptado, aparecerá en la pestaña Eventos."
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
          {esAdmin
            ? "Tu evento se publicará de inmediato"
            : "Envía tu solicitud y la revisaremos antes de publicarla"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={estilos.formulario}
        keyboardShouldPersistTaps="handled"
      >
        {campo("Nombre del evento *", "titulo", {
          placeholder: "Ej. Feria de Anime",
        })}

        <Text style={estilos.label}>Categoría *</Text>
        <View style={estilos.categorias}>
          {INTERESES.map((item) => {
            const activa = form.categoria === item.label;
            return (
              <TouchableOpacity
                key={item.id}
                style={[estilos.chip, activa && estilos.chipActivo]}
                onPress={() => cambiar("categoria")(item.label)}
                activeOpacity={0.8}
              >
                <Text style={[estilos.chipTexto, activa && estilos.chipTextoActivo]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <>
          <Text style={estilos.label}>Fecha *</Text>
          <TouchableOpacity style={estilos.input} onPress={() => setMostrarCalendario(true)}>
            <Text>{form.fecha || "Seleccionar fecha"}</Text>
          </TouchableOpacity>
          {mostrarCalendario ? (
            <DateTimePicker
              value={fechaCalendario}
              mode="date"
              onValueChange={(evento, fecha) => {
                if (!fecha) return;
                setFechaCalendario(fecha);
                setForm((prev) => ({
                  ...prev,
                  fecha: fecha.toLocaleDateString("es-PE"),
                  fechaInicio: aFechaISO(fecha),
                }));
                setMostrarCalendario(false);
              }}
              onDismiss={() => setMostrarCalendario(false)}
            />
          ) : null}
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
          placeholder: "Escribir dirección del sitio web (opcional)",
          autoCapitalize: "none",
          keyboardType: "url",
        })}
        {campo("Imagen (enlace)", "imagen", {
          placeholder: "Escribir dirección de la imagen (opcional)",
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
          <Text style={estilos.botonTexto}>
            {esAdmin ? "Publicar evento" : "Enviar solicitud"}
          </Text>
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
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipActivo: { backgroundColor: "#5B4BDB", borderColor: "#5B4BDB" },
  chipTexto: { fontSize: 13, color: "#444", fontWeight: "600" },
  chipTextoActivo: { color: "#FFF" },
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
});