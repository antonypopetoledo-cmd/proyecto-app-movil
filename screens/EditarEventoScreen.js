import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { editarEvento } from "../services/eventosService";
import { validarImagenEvento } from "../services/solicitudesService";
import { INTERESES, obtenerNombreCategoria } from "../data/categorias";
import {
  crearFechaInicio,
  fechaDesdeInicio,
  formatearFecha,
  formatearHora,
} from "../utils/fechaEvento";

const esBase64 = (valor) => /^data:image\/[a-z0-9.+-]+;base64,/i.test(valor || "");

const imagenDesdeResultado = (resultado) => {
  if (resultado.canceled || !resultado.assets?.length) return null;
  const asset = resultado.assets.at(0);
  return asset?.base64 ? `data:image/jpeg;base64,${asset.base64}` : "";
};

export default function EditarEventoScreen({ route, navigation, sesion }) {
  const evento = route.params.evento;
  const inicio = fechaDesdeInicio(evento.fechaInicio);
  const imagenInicial = evento.imagen || "";

  const [form, setForm] = useState({
    titulo: evento.titulo || "",
    categoria: evento.categoria || "",
    fecha: evento.fecha || "",
    hora: evento.hora || "",
    fechaInicio: evento.fechaInicio || "",
    lugar: evento.lugar || "",
    precio: evento.precio || "",
    organizador: evento.organizador || "",
    enlace: evento.enlace || "",
    descripcion: evento.descripcion || "",
    posicion: evento.posicion || "center",
  });

  const [imagenArchivo, setImagenArchivo] = useState(
    esBase64(imagenInicial) ? imagenInicial : ""
  );
  const [imagenEnlace, setImagenEnlace] = useState(
    !esBase64(imagenInicial) ? imagenInicial : ""
  );
  const [errorVistaPrevia, setErrorVistaPrevia] = useState(false);

  const [fecha, setFecha] = useState(inicio);
  const [hora, setHora] = useState(inicio);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [mostrarEnlace, setMostrarEnlace] = useState(
    Boolean(!esBase64(imagenInicial) && imagenInicial)
  );
  const [guardando, setGuardando] = useState(false);
  const [campoActivo, setCampoActivo] = useState(null);

  const scrollRef = useRef(null);
  const [tecladoAbierto, setTecladoAbierto] = useState(false);

  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", () => {
      setTecladoAbierto(true);
    });
    const ocultar = Keyboard.addListener("keyboardDidHide", () => {
      setTecladoAbierto(false);
    });
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  const enlaceLimpio = imagenEnlace.trim();
  const imagenVista =
    imagenArchivo || (/^https?:\/\//i.test(enlaceLimpio) ? enlaceLimpio : "");

  const cambiar = (campo, valor) =>
    setForm((anterior) => ({ ...anterior, [campo]: valor }));

  const cambiarEnlaceImagen = (texto) => {
    setImagenEnlace(texto);
    setErrorVistaPrevia(false);
  };

  const aceptarImagen = (imagen) => {
    if (imagen === null) return;
    if (!imagen) {
      Alert.alert("Imagen", "No se pudo leer la imagen seleccionada.");
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
  };

  const tomarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Activa el permiso de cámara para tomar una foto."
        );
        return;
      }
      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.3,
        base64: true,
      });
      aceptarImagen(imagenDesdeResultado(resultado));
    } catch (e) {
      Alert.alert("Cámara", "No se pudo abrir la cámara en este dispositivo.");
    }
  };

  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.3,
        base64: true,
      });
      aceptarImagen(imagenDesdeResultado(resultado));
    } catch (e) {
      Alert.alert("Galería", "No se pudo abrir la galería de imágenes.");
    }
  };

  const seleccionarImagen = () => {
    Alert.alert("Cambiar imagen", "Elige cómo quieres actualizar el flyer", [
      { text: "Tomar foto (Cámara)", onPress: tomarFoto },
      { text: "Elegir de galería", onPress: elegirDeGaleria },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const quitarImagen = () => {
    setImagenArchivo("");
    setImagenEnlace("");
    setErrorVistaPrevia(false);
    setMostrarEnlace(false);
  };

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
        "Completa nombre, categoría, fecha, hora y lugar."
      );
    }

    if (form.enlace.trim() && !/^https?:\/\//i.test(form.enlace.trim())) {
      return Alert.alert(
        "Enlace inválido",
        "El enlace oficial debe empezar con http:// o https://"
      );
    }

    const imagenFinal = imagenArchivo || enlaceLimpio;
    const problemaImagen = validarImagenEvento(imagenFinal);
    if (problemaImagen) {
      return Alert.alert("Imagen inválida", problemaImagen);
    }

    setGuardando(true);
    const cambios = {
      ...form,
      titulo: form.titulo.trim(),
      lugar: form.lugar.trim(),
      precio: form.precio.trim() || "Gratis",
      organizador: form.organizador.trim(),
      enlace: form.enlace.trim(),
      descripcion: form.descripcion.trim(),
      imagen: imagenFinal,
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
            navigation.popTo("DetalleEvento", { evento: eventoActualizado }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

      {/* Formulario ordenado */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          estilos.formulario,
          tecladoAbierto && { paddingBottom: 220 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.etiqueta}>Nombre del evento *</Text>
        <TextInput
          style={estilos.input}
          value={form.titulo}
          onChangeText={(valor) => cambiar("titulo", valor)}
          placeholder="Ej. Feria de Anime"
          placeholderTextColor="#999"
          editable={!guardando}
        />

        <Text style={estilos.etiqueta}>Categoría *</Text>
        <View style={estilos.categorias}>
          {INTERESES.map((item) => {
            const nombreActual = obtenerNombreCategoria(form.categoria);
            const activa =
              form.categoria === item.id ||
              form.categoria === item.label ||
              nombreActual === `${item.emoji} ${item.label}`;
            return (
              <TouchableOpacity
                key={item.id}
                style={[estilos.chip, activa && estilos.chipActivo]}
                onPress={() => cambiar("categoria", item.id)}
                disabled={guardando}
              >
                <Text
                  style={[estilos.chipTexto, activa && estilos.chipTextoActivo]}
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
          <Text style={estilos.textoSelector}>
            {form.fecha || "Seleccionar fecha"}
          </Text>
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
          <Text style={estilos.textoSelector}>
            {form.hora || "Seleccionar hora"}
          </Text>
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

                <Text style={estilos.etiqueta}>Lugar *</Text>
        <TextInput
          style={estilos.input}
          value={form.lugar}
          onChangeText={(valor) => cambiar("lugar", valor)}
          placeholder="Dirección o recinto"
          placeholderTextColor="#999"
          editable={!guardando}
        />

        <Text style={estilos.etiqueta}>Precio</Text>
        <TextInput
          style={estilos.input}
          value={form.precio}
          onChangeText={(valor) => cambiar("precio", valor)}
          placeholder="Ej. Gratis o Desde S/ 50"
          placeholderTextColor="#999"
          editable={!guardando}
        />

        <Text style={estilos.etiqueta}>Organizador</Text>
        <TextInput
          style={estilos.input}
          value={form.organizador}
          onChangeText={(valor) => cambiar("organizador", valor)}
          placeholder="Nombre del organizador"
          placeholderTextColor="#999"
          editable={!guardando}
        />

        <Text style={estilos.etiqueta}>Enlace oficial</Text>
        <TextInput
          style={estilos.input}
          value={form.enlace}
          onChangeText={(valor) => cambiar("enlace", valor)}
          placeholder="https://..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="url"
          editable={!guardando}
          onFocus={() => setCampoActivo("enlace")}
          onBlur={() => setCampoActivo(null)}
          selection={campoActivo !== "enlace" ? { start: 0, end: 0 } : undefined}
        />

        {/* Sección de imagen con cámara/galería, botón quitar y encuadre */}
        <Text style={estilos.etiqueta}>Imagen del evento</Text>

        {imagenVista ? (
          <View style={estilos.previewContenedor}>
            {errorVistaPrevia ? (
              <View style={[estilos.vistaPreviaImagen, estilos.previewError]}>
                <MaterialIcons name="broken-image" size={32} color="#999" />
                <Text style={estilos.previewErrorTexto}>
                  No se pudo cargar la imagen
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
              disabled={guardando}
            >
              <MaterialIcons name="close" size={18} color="#FFF" />
            </TouchableOpacity>

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
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={estilos.botonImagen}
              onPress={seleccionarImagen}
              disabled={guardando}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-photo-alternate" size={20} color="#5B4BDB" />
              <Text style={estilos.botonImagenTexto}>
                Subir imagen (Cámara / Galería)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMostrarEnlace((prev) => !prev)}
              activeOpacity={0.7}
              disabled={guardando}
            >
              <Text
                style={[
                  estilos.separador,
                  { color: "#5B4BDB", fontWeight: "600" },
                ]}
              >
                {mostrarEnlace
                  ? "Ocultar enlace"
                  : "o usa un enlace (opcional)"}
              </Text>
            </TouchableOpacity>

            {mostrarEnlace ? (
              <TextInput
                style={estilos.input}
                value={imagenEnlace}
                onChangeText={cambiarEnlaceImagen}
                placeholder="https://ejemplo.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="url"
                editable={!guardando}
                onFocus={() => setCampoActivo("imagenEnlace")}
                onBlur={() => setCampoActivo(null)}
                selection={
                  campoActivo !== "imagenEnlace" ? { start: 0, end: 0 } : undefined
                }
              />
            ) : null}
          </>
        )}

        <Text style={estilos.etiqueta}>Descripción</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          value={form.descripcion}
          onChangeText={(valor) => cambiar("descripcion", valor)}
          placeholder="Detalles del evento"
          placeholderTextColor="#999"
          multiline={true}
          editable={!guardando}
          onFocus={() => {
            setCampoActivo("descripcion");
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 250);
          }}
          onBlur={() => setCampoActivo(null)}
        />

        <TouchableOpacity
          style={[estilos.boton, guardando && estilos.botonDeshabilitado]}
          onPress={guardar}
          disabled={guardando}
        >
          <Text style={estilos.botonTexto}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6FF" },
  cabeceraFija: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5B4BDB",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  botonAtras: {
    marginRight: 12,
    padding: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  formulario: {
    padding: 20,
    paddingBottom: 40,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    marginBottom: 14,
    justifyContent: "center",
  },
  inputMultilinea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  inputBloqueado: {
    backgroundColor: "#EEE",
    color: "#888",
  },
  textoSelector: {
    fontSize: 15,
    color: "#222",
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
  },
  chipActivo: {
    backgroundColor: "#5B4BDB",
    borderColor: "#5B4BDB",
  },
  chipTexto: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: "#FFF",
  },
  botonImagen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EBE8FF",
    borderWidth: 1,
    borderColor: "#5B4BDB",
    borderStyle: "dashed",
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 12,
  },
  botonImagenTexto: {
    color: "#5B4BDB",
    fontSize: 14,
    fontWeight: "700",
  },
  previewContenedor: {
    position: "relative",
    marginBottom: 8,
  },
  vistaPreviaImagen: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#EAEAEA",
  },
  previewError: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewErrorTexto: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
  },
  botonQuitar: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.68)",
    alignItems: "center",
    justifyContent: "center",
  },
  encuadreBox: {
    marginTop: 10,
    marginBottom: 6,
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
  separador: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginVertical: 6,
  },
  boton: {
    backgroundColor: "#5B4BDB",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  botonDeshabilitado: {
    backgroundColor: "#B8B0EB",
  },
  botonTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
