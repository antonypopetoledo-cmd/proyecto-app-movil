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
import { crearFechaInicio, formatearFecha, formatearHora } from "../utils/fechaEvento";

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

function CampoTexto({
  etiqueta,
  valor,
  onChangeText,
  placeholder,
  multilinea = false,
  autoCapitalize = "sentences",
  keyboardType = "default",
  editable = true,
  esUrl = false,
}) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View>
      <Text style={estilos.label}>{etiqueta}</Text>
      <TextInput
        style={[estilos.input, multilinea && estilos.inputMultilinea]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={valor}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multilinea}
        editable={editable}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        selection={esUrl && !enfocado ? { start: 0, end: 0 } : undefined}
      />
    </View>
  );
}

export default function PublicarScreen({ sesion, navigation }) {
  const { enviarSolicitud } = useSolicitudes(sesion);
  const [form, setForm] = useState(CAMPOS_VACIOS);
  const [error, setError] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarReloj, setMostrarReloj] = useState(false);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [horaCalendario, setHoraCalendario] = useState(new Date());
  const [enviando, setEnviando] = useState(false);

  const esAdmin = sesion?.rol === "administrador";

  const cambiar = (campo) => (texto) =>
    setForm((prev) => ({ ...prev, [campo]: texto }));

  const enviar = async () => {
    if (
      !form.titulo.trim() ||
      !form.categoria.trim() ||
      !form.fecha.trim() ||
      !form.hora.trim() ||
      !form.lugar.trim()
    ) {
      setError("Nombre, categoría, fecha, hora y lugar son obligatorios.");
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
    if (enviando) return;
    setEnviando(true);
    try {
      await enviarSolicitud(form);
      setForm(CAMPOS_VACIOS);
      Alert.alert(
        esAdmin ? "Evento publicado" : "Solicitud enviada",
        esAdmin
          ? "Tu evento ya aparece en la pestaña Eventos."
          : "Tu evento quedó pendiente de revisión. Si es aceptado, aparecerá en la pestaña Eventos."
      );
    } catch (e) {
      setError("No se pudo enviar la solicitud. Revisa tu conexión e inténtalo otra vez.");
    } finally {
      setEnviando(false);
    }
  };

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
        <CampoTexto
          etiqueta="Nombre del evento *"
          valor={form.titulo}
          onChangeText={cambiar("titulo")}
          placeholder="Ej. Feria de Anime"
          editable={!enviando}
        />

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
                disabled={enviando}
              >
                <Text style={[estilos.chipTexto, activa && estilos.chipTextoActivo]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View>
          <Text style={estilos.label}>Fecha *</Text>
          <TouchableOpacity
            style={estilos.input}
            onPress={() => setMostrarCalendario(true)}
            disabled={enviando}
          >
            <Text style={{ color: form.fecha ? "#222" : "#999" }}>
              {form.fecha || "Seleccionar fecha"}
            </Text>
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
                  fecha: formatearFecha(fecha),
                  fechaInicio: crearFechaInicio(fecha, horaCalendario),
                }));
                setMostrarCalendario(false);
              }}
              onDismiss={() => setMostrarCalendario(false)}
            />
          ) : null}
        </View>

        <View>
          <Text style={estilos.label}>Hora *</Text>
          <TouchableOpacity
            style={estilos.input}
            onPress={() => setMostrarReloj(true)}
            disabled={enviando}
          >
            <Text style={{ color: form.hora ? "#222" : "#999" }}>
              {form.hora || "Seleccionar hora"}
            </Text>
          </TouchableOpacity>
          {mostrarReloj ? (
            <DateTimePicker
              value={horaCalendario}
              mode="time"
              display="clock"
              onValueChange={(evento, hora) => {
                if (!hora) return;
                setHoraCalendario(hora);
                setForm((prev) => ({
                  ...prev,
                  hora: formatearHora(hora),
                  fechaInicio: crearFechaInicio(fechaCalendario, hora),
                }));
                setMostrarReloj(false);
              }}
              onDismiss={() => setMostrarReloj(false)}
            />
          ) : null}
        </View>

        <CampoTexto
          etiqueta="Lugar *"
          valor={form.lugar}
          onChangeText={cambiar("lugar")}
          placeholder="Ej. Costa 21, San Miguel"
          editable={!enviando}
        />

        <CampoTexto
          etiqueta="Precio"
          valor={form.precio}
          onChangeText={cambiar("precio")}
          placeholder="Ej. Gratis, Desde S/ 20"
          editable={!enviando}
        />

        <CampoTexto
          etiqueta="Organizador"
          valor={form.organizador}
          onChangeText={cambiar("organizador")}
          placeholder="Ej. Live Nation Perú"
          editable={!enviando}
        />

        <CampoTexto
          etiqueta="Enlace oficial"
          valor={form.enlace}
          onChangeText={cambiar("enlace")}
          placeholder="Escribir dirección del sitio web"
          autoCapitalize="none"
          keyboardType="url"
          editable={!enviando}
          esUrl={true}
        />

        <CampoTexto
          etiqueta="Imagen (enlace)"
          valor={form.imagen}
          onChangeText={cambiar("imagen")}
          placeholder="Escribir dirección de la imagen"
          autoCapitalize="none"
          keyboardType="url"
          editable={!enviando}
          esUrl={true}
        />

        <CampoTexto
          etiqueta="Descripción"
          valor={form.descripcion}
          onChangeText={cambiar("descripcion")}
          placeholder="Cuéntanos de qué trata el evento"
          multilinea={true}
          editable={!enviando}
        />

        {error ? <Text style={estilos.error}>{error}</Text> : null}

        <TouchableOpacity
          style={estilos.boton}
          onPress={enviar}
          activeOpacity={0.8}
          disabled={enviando}
        >
          <Text style={estilos.botonTexto}>
            {enviando ? "Guardando..." : esAdmin ? "Publicar evento" : "Enviar solicitud"}
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
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActivo: {
    backgroundColor: "#5B4BDB",
    borderColor: "#5B4BDB",
  },
  chipTexto: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  chipTextoActivo: {
    color: "#FFF",
    fontWeight: "600",
  },
  error: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  boton: {
    backgroundColor: "#5B4BDB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  botonTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});