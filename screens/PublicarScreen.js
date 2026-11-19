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
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import useSolicitudes from "../hooks/useSolicitudes";
import { validarImagenEvento } from "../services/solicitudesService";
import { INTERESES } from "../data/categorias";
import {
  crearFechaInicio,
  formatearFecha,
  formatearHora,
} from "../utils/fechaEvento";

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
  descripcion: "",
  posicion: "center",
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
        style={[
          estilos.input,
          multilinea && estilos.inputMultilinea,
          !editable && estilos.inputBloqueado,
        ]}
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

// Convierte el resultado del selector en "data:image/jpeg;base64,..."
// (mismo formato que usa la foto de perfil). Si no hay base64 devuelve "",
// porque una ruta local del teléfono no serviría para otros usuarios.
const imagenDesdeResultado = (resultado) => {
  if (resultado.canceled || !resultado.assets?.[0]) return null;
  const { base64 } = resultado.assets[0];
  return base64 ? `data:image/jpeg;base64,${base64}` : "";
};

export default function PublicarScreen({ sesion, navigation }) {
  const { enviarSolicitud } = useSolicitudes(sesion);
  const [form, setForm] = useState(CAMPOS_VACIOS);
  const [imagenArchivo, setImagenArchivo] = useState("");
  const [imagenEnlace, setImagenEnlace] = useState("");
  const [errorVistaPrevia, setErrorVistaPrevia] = useState(false);
  const [error, setError] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarReloj, setMostrarReloj] = useState(false);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [horaCalendario, setHoraCalendario] = useState(new Date());
  const [enviando, setEnviando] = useState(false);

  const esAdmin = sesion?.rol === "administrador";

  // Lo que se ve en la vista previa: primero el archivo elegido y, si no hay,
  // el enlace (solo cuando ya parece una dirección válida).
  const enlaceLimpio = imagenEnlace.trim();
  const imagenVista =
    imagenArchivo || (/^https?:\/\//i.test(enlaceLimpio) ? enlaceLimpio : "");

  const cambiar = (campo) => (texto) =>
    setForm((prev) => ({ ...prev, [campo]: texto }));

  const cambiarEnlaceImagen = (texto) => {
    setImagenEnlace(texto);
    setErrorVistaPrevia(false);
  };

  // Guarda la imagen elegida revisando que no sea demasiado pesada
  const aceptarImagen = (imagen) => {
    if (imagen === null) return; // el usuario canceló
    if (!imagen) {
      Alert.alert(
        "Imagen",
        "No se pudo leer la imagen seleccionada. Prueba con otra.",
      );
      return;
    }
    const problema = validarImagenEvento(imagen);
    if (problema) {
      Alert.alert("Imagen", problema);
      return;
    }
    setImagenArchivo(imagen);
    setImagenEnlace("");
    setErrorVistaPrevia(false);
    setError("");
  };

  const tomarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Activa el permiso de cámara en la configuración de tu teléfono para tomar la foto del evento.",
        );
        return;
      }
      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });
      aceptarImagen(imagenDesdeResultado(resultado));
    } catch (e) {
      Alert.alert("Cámara", "No se pudo abrir la cámara en este dispositivo.");
    }
  };

  // El selector de galería del sistema no necesita pedir permiso antes
  // (ver docs de expo-image-picker), así que se abre directamente.
  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });
      aceptarImagen(imagenDesdeResultado(resultado));
    } catch (e) {
      Alert.alert("Galería", "No se pudo abrir la galería de imágenes.");
    }
  };

  const seleccionarImagen = () => {
    Alert.alert("Imagen del evento", "Elige cómo quieres agregar el flyer", [
      { text: "Tomar foto (Cámara)", onPress: tomarFoto },
      { text: "Elegir de galería", onPress: elegirDeGaleria },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const quitarImagen = () => {
    setImagenArchivo("");
    setImagenEnlace("");
    setErrorVistaPrevia(false);
  };

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
    // El archivo elegido tiene prioridad; el enlace es la opción secundaria
    const imagenFinal = imagenArchivo || enlaceLimpio;
    const problemaImagen = validarImagenEvento(imagenFinal);
    if (problemaImagen) {
      setError(problemaImagen);
      return;
    }

    setError("");
    if (enviando) return;
    setEnviando(true);
    try {
      await enviarSolicitud({ ...form, imagen: imagenFinal });
      setForm(CAMPOS_VACIOS);
      quitarImagen();
      Alert.alert(
        esAdmin ? "Evento publicado" : "Solicitud enviada",
        esAdmin
          ? "Tu evento ya aparece en la pestaña Eventos."
          : "Tu evento quedó pendiente de revisión. Si es aceptado, aparecerá en la pestaña Eventos.",
      );
    } catch (e) {
      setError(
        "No se pudo enviar la solicitud. Revisa tu conexión e inténtalo otra vez.",
      );
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
                <Text
                  style={[estilos.chipTexto, activa && estilos.chipTextoActivo]}
                >
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

        {/* Imagen del evento: botón principal (cámara/galería) + enlace secundario */}
        <Text style={estilos.label}>Imagen del evento</Text>
        <TouchableOpacity
          style={estilos.botonImagen}
          onPress={seleccionarImagen}
          activeOpacity={0.8}
          disabled={enviando}
        >
          <MaterialIcons name="add-photo-alternate" size={22} color="#5B4BDB" />
          <Text style={estilos.botonImagenTexto}>
            Seleccionar imagen del evento
          </Text>
        </TouchableOpacity>

        {imagenVista ? (
          <View style={estilos.previewContenedor}>
            {errorVistaPrevia ? (
              <View style={[estilos.preview, estilos.previewError]}>
                <MaterialIcons name="broken-image" size={32} color="#999" />
                <Text style={estilos.previewErrorTexto}>
                  No se pudo cargar la imagen de ese enlace
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: imagenVista }}
                style={estilos.vistaPreviaImagen}
                contentFit="cover"
                contentPosition={form.posicion || "center"}
                onError={() => setErrorVistaPrevia(true)}
              />
            )}

            <TouchableOpacity
              style={estilos.botonQuitar}
              onPress={quitarImagen}
              activeOpacity={0.8}
              disabled={enviando}
            >
              <MaterialIcons name="close" size={18} color="#FFF" />
            </TouchableOpacity>

            {/* Botones de ajuste de encuadre (solo si la imagen cargó bien) */}
            {!errorVistaPrevia && (
              <View style={estilos.encuadreBox}>
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
                        onPress={() => cambiar("posicion")(op.id)}
                        disabled={enviando}
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
            )}
          </View>
        ) : null}

        <Text style={estilos.separador}>
          {imagenArchivo
            ? "Quita la imagen para usar un enlace"
            : "o usa un enlace (opcional)"}
        </Text>
        <CampoTexto
          etiqueta="Imagen (enlace)"
          valor={imagenEnlace}
          onChangeText={cambiarEnlaceImagen}
          placeholder="Escribir dirección de la imagen"
          autoCapitalize="none"
          keyboardType="url"
          editable={!enviando && !imagenArchivo}
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
            {enviando
              ? "Guardando..."
              : esAdmin
                ? "Publicar evento"
                : "Enviar solicitud"}
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
  inputBloqueado: { backgroundColor: "#EEE", color: "#777" },
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
  botonImagen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#5B4BDB",
    borderStyle: "dashed",
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  botonImagenTexto: {
    color: "#5B4BDB",
    fontSize: 15,
    fontWeight: "700",
  },
  previewContenedor: {
    position: "relative",
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#E8E8F0",
  },
  previewError: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  previewErrorTexto: {
    color: "#777",
    fontSize: 13,
  },
  botonQuitar: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  separador: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 8,
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
  vistaPreviaImagen: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  encuadreBox: {
    marginTop: 10,
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
