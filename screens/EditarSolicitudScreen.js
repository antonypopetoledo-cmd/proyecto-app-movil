import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";
import DateTimePicker from "@react-native-community/datetimepicker";
import { INTERESES } from "../data/categorias";
import {
  crearFechaInicio,
  fechaDesdeInicio,
  formatearFecha,
  formatearHora,
} from "../utils/fechaEvento";

const CAMPOS_TEXTO = [
  { key: "titulo", label: "Nombre del evento *", placeholder: "Ej. Feria de Anime" },
  { key: "lugar", label: "Lugar *", placeholder: "Ej. Costa 21, San Miguel" },
  { key: "precio", label: "Precio", placeholder: "Ej. Gratis, Desde S/ 20" },
  { key: "organizador", label: "Organizador", placeholder: "Ej. Comunidad LimaGo" },
  { key: "enlace", label: "Enlace oficial", placeholder: "https://..." },
  { key: "imagen", label: "Enlace de imagen", placeholder: "https://..." },
  { key: "descripcion", label: "Descripción", placeholder: "Detalles del evento...", multilinea: true },
];

export default function EditarSolicitudScreen({ route, navigation, sesion }) {
  const solicitud = route.params.solicitud;
  const { reenviarSolicitud } = useSolicitudes(sesion);
  const inicio = fechaDesdeInicio(solicitud.fechaInicio);

  const [form, setForm] = useState({
    titulo: solicitud.titulo || "",
    categoria: solicitud.categoria || "",
    fecha: solicitud.fecha || "",
    fechaInicio: solicitud.fechaInicio || "",
    hora: solicitud.hora || "",
    lugar: solicitud.lugar || "",
    precio: solicitud.precio || "",
    organizador: solicitud.organizador || "",
    enlace: solicitud.enlace || "",
    imagen: solicitud.imagen || "",
    descripcion: solicitud.descripcion || "",
  });

  const [fecha, setFecha] = useState(inicio);
  const [hora, setHora] = useState(inicio);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cambiarFecha = (evento, valor) => {
    setMostrarFecha(false);
    if (!valor) return;
    setFecha(valor);
    setForm((anterior) => ({
      ...anterior,
      fecha: formatearFecha(valor),
      fechaInicio: crearFechaInicio(valor, hora),
    }));
  };

  const cambiarHora = (evento, valor) => {
    setMostrarHora(false);
    if (!valor) return;
    setHora(valor);
    setForm((anterior) => ({
      ...anterior,
      hora: formatearHora(valor),
      fechaInicio: crearFechaInicio(fecha, valor),
    }));
  };

  const guardar = async () => {
    if (
      !form.titulo.trim() ||
      !form.categoria.trim() ||
      !form.fecha.trim() ||
      !form.hora.trim() ||
      !form.lugar.trim()
    ) {
      return Alert.alert(
        "Campos obligatorios",
        "Completa nombre, categoría, fecha, hora y lugar."
      );
    }

    if (guardando) return;
    setGuardando(true);
    try {
      const ok = await reenviarSolicitud(solicitud.id, {
        ...form,
        titulo: form.titulo.trim(),
        lugar: form.lugar.trim(),
        precio: form.precio.trim() || "Gratis",
      });
      if (ok) {
        Alert.alert(
          "Solicitud reenviada",
          "Volverá a quedar pendiente de revisión.",
          [{ text: "Aceptar", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("No disponible", "La solicitud ya no se puede reenviar.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo reenviar la solicitud.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={estilos.formulario}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Text style={estilos.titulo}>Corregir publicación</Text>

        <Text style={estilos.etiqueta}>Nombre del evento *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ej. Feria de Anime"
          value={form.titulo}
          onChangeText={(valor) => setForm({ ...form, titulo: valor })}
          editable={!guardando}
        />

        <Text style={estilos.etiqueta}>Categoría *</Text>
        <View style={estilos.categorias}>
          {INTERESES.map((item) => {
            const activa =
              form.categoria === item.id || form.categoria === item.label;
            return (
              <TouchableOpacity
                key={item.id}
                style={[estilos.chip, activa && estilos.chipActivo]}
                onPress={() => setForm({ ...form, categoria: item.id })}
                disabled={guardando}
              >
                <Text
                  style={[
                    estilos.chipTexto,
                    activa && estilos.chipTextoActivo,
                  ]}
                >
                  {item.emoji ? `${item.emoji} ` : ""}
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={estilos.etiqueta}>Fecha *</Text>
        <TouchableOpacity
          style={estilos.input}
          onPress={() => setMostrarFecha(true)}
          disabled={guardando}
        >
          <Text style={{ color: form.fecha ? "#222" : "#999" }}>
            {form.fecha || "Seleccionar fecha"}
          </Text>
        </TouchableOpacity>
        {mostrarFecha ? (
          <DateTimePicker
            value={fecha}
            mode="date"
            minimumDate={new Date()}
            onChange={cambiarFecha}
          />
        ) : null}

        <Text style={estilos.etiqueta}>Hora *</Text>
        <TouchableOpacity
          style={estilos.input}
          onPress={() => setMostrarHora(true)}
          disabled={guardando}
        >
          <Text style={{ color: form.hora ? "#222" : "#999" }}>
            {form.hora || "Seleccionar hora"}
          </Text>
        </TouchableOpacity>
        {mostrarHora ? (
          <DateTimePicker
            value={hora}
            mode="time"
            display="clock"
            onChange={cambiarHora}
          />
        ) : null}

        {CAMPOS_TEXTO.slice(1).map((campo) => (
          <View key={campo.key}>
            <Text style={estilos.etiqueta}>{campo.label}</Text>
            <TextInput
              style={[
                estilos.input,
                campo.multilinea && estilos.inputMultilinea,
              ]}
              placeholder={campo.placeholder}
              value={String(form[campo.key])}
              onChangeText={(valor) =>
                setForm({ ...form, [campo.key]: valor })
              }
              multiline={campo.multilinea}
              editable={!guardando}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[estilos.boton, guardando && { opacity: 0.6 }]}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={estilos.botonTexto}>
            {guardando ? "Reenviando..." : "Reenviar para aprobación"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  formulario: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#1E1E2D", marginBottom: 16 },
  etiqueta: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: "#222",
  },
  inputMultilinea: { minHeight: 85, textAlignVertical: "top" },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#5B4BDB",
  },
  chipActivo: { backgroundColor: "#5B4BDB" },
  chipTexto: { color: "#5B4BDB", fontSize: 13, fontWeight: "600" },
  chipTextoActivo: { color: "#FFF" },
  boton: {
    backgroundColor: "#5B4BDB",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold", fontSize: 15 },
});
