import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { editarEvento } from "../services/eventosService";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  crearFechaInicio,
  fechaDesdeInicio,
  formatearFecha,
  formatearHora,
} from "../utils/fechaEvento";

const CAMPOS = [
  "titulo",
  "categoria",
  "lugar",
  "precio",
  "organizador",
  "enlace",
  "imagen",
  "descripcion",
];

export default function EditarEventoScreen({ route, navigation, sesion }) {
  const evento = route.params.evento;
  const inicio = fechaDesdeInicio(evento.fechaInicio);
  const [form, setForm] = useState({
    ...Object.fromEntries(CAMPOS.map((campo) => [campo, evento[campo] || ""])),
    fecha: evento.fecha || "",
    hora: evento.hora || "",
    fechaInicio: evento.fechaInicio || "",
    posicion: evento.posicion || "center",
  });
  const [fecha, setFecha] = useState(inicio);
  const [hora, setHora] = useState(inicio);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [campoActivo, setCampoActivo] = useState(null);

  const cambiar = (campo, valor) =>
    setForm((anterior) => ({ ...anterior, [campo]: valor }));

  const guardar = async () => {
    if (guardando) return;
    if (
      !form.titulo.trim() ||
      !form.categoria.trim() ||
      !form.fecha.trim() ||
      !form.hora.trim() ||
      !form.lugar.trim()
    ) {
      return Alert.alert(
        "Campos obligatorios",
        "Completa nombre, categoría, fecha, hora y lugar.",
      );
    }

    setGuardando(true);
    const cambios = {
      ...form,
      fecha: form.fecha,
      hora: form.hora,
      fechaInicio: form.fechaInicio,
      posicion: form.posicion || "center",
    };
    const resultado = await editarEvento(evento.id, cambios, sesion);
    setGuardando(false);

    if (!resultado.ok)
      return Alert.alert("No se pudo guardar", resultado.mensaje);

    const eventoActualizado = { ...evento, ...cambios };
    Alert.alert(
      "Evento actualizado",
      "Los cambios ya aparecen en el catálogo.",
      [
        {
          text: "Aceptar",
          onPress: () =>
            navigation.navigate("DetalleEvento", { evento: eventoActualizado }),
        },
      ],
    );
  };

  return (
    <View style={estilos.contenedor}>
      {/* Cabecera morada fijada arriba */}
      <View style={estilos.cabeceraFija}>
        <TouchableOpacity
          style={estilos.botonAtras}
          onPress={() => navigation.goBack()}
          disabled={guardando}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.titulo}>Editar evento</Text>
      </View>

      {/* Formulario desplazable debajo */}
      <ScrollView
        contentContainerStyle={estilos.formulario}
        keyboardShouldPersistTaps="handled"
      >
        {CAMPOS.map((campo) => {
          const esUrl = campo === "enlace" || campo === "imagen";
          return (
            <View key={campo}>
              <Text style={estilos.etiqueta}>{campo}</Text>
              <TextInput
                style={estilos.input}
                value={String(form[campo])}
                onChangeText={(valor) => cambiar(campo, valor)}
                multiline={campo === "descripcion"}
                editable={!guardando}
                autoCapitalize={esUrl ? "none" : "sentences"}
                keyboardType={esUrl ? "url" : "default"}
                onFocus={() => setCampoActivo(campo)}
                onBlur={() => setCampoActivo(null)}
                selection={
                  esUrl && campoActivo !== campo
                    ? { start: 0, end: 0 }
                    : undefined
                }
              />

              {/* Vista previa y ajuste de encuadre debajo del campo imagen */}
              {campo === "imagen" && form.imagen?.trim() ? (
                <View style={estilos.encuadreBox}>
                  <Image
                    source={{ uri: form.imagen.trim() }}
                    style={estilos.vistaPreviaImagen}
                    contentFit="cover"
                    contentPosition={form.posicion || "center"}
                  />
                  <Text style={estilos.encuadreTitulo}>
                    Encuadre en tarjeta del catálogo:
                  </Text>
                  <View style={estilos.encuadreFila}>
                    {[
                      { id: "top", label: "Arriba" },
                      { id: "center", label: "Centro" },
                      { id: "bottom", label: "Abajo" },
                    ].map((op) => {
                      const activo = (form.posicion || "center") === op.id;
                      return (
                        <TouchableOpacity
                          key={op.id}
                          style={[
                            estilos.encuadreBtn,
                            activo && estilos.encuadreBtnActivo,
                          ]}
                          onPress={() => cambiar("posicion", op.id)}
                          disabled={guardando}
                        >
                          <Text
                            style={[
                              estilos.encuadreBtnTexto,
                              activo && estilos.encuadreBtnTextoActivo,
                            ]}
                          >
                            {op.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={estilos.etiqueta}>Fecha *</Text>
        <TouchableOpacity
          style={estilos.input}
          onPress={() => setMostrarFecha(true)}
          disabled={guardando}
        >
          <Text>{form.fecha || "Seleccionar fecha"}</Text>
        </TouchableOpacity>
        {mostrarFecha ? (
          <DateTimePicker
            value={fecha}
            mode="date"
            onValueChange={(eventoCambio, valor) => {
              if (!valor) return;
              setFecha(valor);
              setForm((anterior) => ({
                ...anterior,
                fecha: formatearFecha(valor),
                fechaInicio: crearFechaInicio(valor, hora),
              }));
              setMostrarFecha(false);
            }}
            onDismiss={() => setMostrarFecha(false)}
          />
        ) : null}

        <Text style={estilos.etiqueta}>Hora *</Text>
        <TouchableOpacity
          style={estilos.input}
          onPress={() => setMostrarHora(true)}
          disabled={guardando}
        >
          <Text>{form.hora || "Seleccionar hora"}</Text>
        </TouchableOpacity>
        {mostrarHora ? (
          <DateTimePicker
            value={hora}
            mode="time"
            display="clock"
            onValueChange={(eventoCambio, valor) => {
              if (!valor) return;
              setHora(valor);
              setForm((anterior) => ({
                ...anterior,
                hora: formatearHora(valor),
                fechaInicio: crearFechaInicio(fecha, valor),
              }));
              setMostrarHora(false);
            }}
            onDismiss={() => setMostrarHora(false)}
          />
        ) : null}

        <TouchableOpacity
          style={estilos.boton}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={estilos.botonTexto}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  cabeceraFija: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: "#5B4BDB",
    gap: 12,
  },
  botonAtras: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  formulario: { padding: 20, paddingBottom: 40 },
  etiqueta: {
    textTransform: "capitalize",
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  boton: {
    backgroundColor: "#5B4BDB",
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
  },
  botonTexto: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
    vistaPreviaImagen: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
  },
  encuadreBox: {
    marginBottom: 14,
  },
  encuadreTitulo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  encuadreFila: {
    flexDirection: "row",
    gap: 8,
  },
  encuadreBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  encuadreBtnActivo: {
    backgroundColor: "#5B4BDB",
    borderColor: "#5B4BDB",
  },
  encuadreBtnTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  encuadreBtnTextoActivo: {
    color: "#FFF",
  },
});