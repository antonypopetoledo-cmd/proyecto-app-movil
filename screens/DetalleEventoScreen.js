import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eliminarEvento } from "../services/eventosService";
import { registrarAsistencia } from "../services/asistenciasService";
import { enviarCorreoConfirmacion } from "../services/emailService";
import useFavoritos from "../hooks/useFavoritos";

// Fila con icono + etiqueta y su valor debajo
const Dato = ({ icono, etiqueta, children }) => (
  <>
    <View style={styles.etiquetaFila}>
      <MaterialIcons name={icono} size={16} color="#777" />
      <Text style={styles.label}>{etiqueta}</Text>
    </View>
    <Text style={styles.valor}>{children}</Text>
  </>
);

export default function DetalleEventoScreen({ route, navigation, sesion }) {
  const { evento } = route.params;
  const esSolicitud = route.params.esSolicitud === true;
  const [recordatorioEnviado, setRecordatorioEnviado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const { favoritos, alternarFavorito } = useFavoritos(sesion?.uid);
  const esFavorito = favoritos.includes(evento.id);

  const toggleFavorito = async () => {
    try {
      await alternarFavorito(evento.id);
    } catch (e) {
      Alert.alert("Favoritos", "No se pudo actualizar favoritos.");
    }
  };

  const insets = useSafeAreaInsets();

  const esAdmin = sesion?.rol === "administrador";
  const puedeGestionar = esAdmin && !esSolicitud;
  // "Recordarme" solo para usuarios y solo en eventos ya publicados (no en solicitudes pendientes)
  const puedeGuardarRecordatorio = !esAdmin && !esSolicitud;

  // registrarAsistencia (Firestore) devuelve true si creó el registro y false si ya existía.
  // El correo de recordatorio se envía solo en el primer registro.
  const activarRecordatorioCorreo = async () => {
    if (procesando || recordatorioEnviado) return;
    setProcesando(true);
    try {
      const creada = await registrarAsistencia(sesion.uid, evento.id);
      setRecordatorioEnviado(true);
      if (!creada) {
        Alert.alert(
          "Recordatorio ya activado",
          "Ya habías guardado este evento y recibido su recordatorio.",
        );
        return;
      }
      const correo = await enviarCorreoConfirmacion({ sesion, evento });
      Alert.alert(
        "¡Recordatorio activado!",
        correo.ok
          ? `Guardamos el evento y te enviamos los detalles a ${sesion.email}.`
          : "Guardamos el evento en tu lista, pero no pudimos enviar el correo de recordatorio.",
      );
    } catch (e) {
      Alert.alert("No se pudo activar", e?.message || "Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirMapa = () => {
    const query = encodeURIComponent(evento.lugar);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    ).catch(() => Alert.alert("No se pudo abrir el mapa"));
  };

  const abrirEnlace = () => {
    Linking.openURL(evento.enlace).catch(() =>
      Alert.alert("No se pudo abrir el enlace"),
    );
  };

  const editar = () => navigation.navigate("EditarEvento", { evento });

  const eliminar = () =>
    Alert.alert("Eliminar evento", `¿Deseas eliminar "${evento.titulo}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const resultado = await eliminarEvento(evento.id, sesion);
          if (!resultado.ok) {
            Alert.alert("Acceso denegado", resultado.mensaje);
            return;
          }
          navigation.goBack();
        },
      },
    ]);

  return (
    <View style={styles.container}>
      {/* Barra fija sobre la imagen: volver y, para el admin, editar y eliminar */}
      <View style={[styles.barraSuperior, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.botonCircular}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <MaterialIcons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>

        {puedeGestionar ? (
          <View style={styles.accionesGestion}>
            <TouchableOpacity
              style={styles.botonCircular}
              onPress={editar}
              accessibilityLabel="Editar"
            >
              <MaterialIcons name="edit" size={20} color="#5B4BDB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonCircular}
              onPress={eliminar}
              accessibilityLabel="Eliminar"
            >
              <MaterialIcons name="delete-outline" size={22} color="#E53935" />
            </TouchableOpacity>
          </View>
        ) : !esSolicitud ? (
          <TouchableOpacity
            style={styles.botonCircular}
            onPress={toggleFavorito}
            accessibilityLabel="Favorito"
          >
            <MaterialIcons
              name={esFavorito ? "favorite" : "favorite-border"}
              size={22}
              color={esFavorito ? "#E53935" : "#222"}
            />
          </TouchableOpacity>
        ) : null}
      </View>


      <ScrollView>
        {evento.imagen ? (
          <Image
            source={{ uri: evento.imagen }}
            style={styles.image}
            contentFit="cover"
            contentPosition={evento.posicion || "center"}
          />
        ) : (
          <View style={[styles.image, styles.sinImagen]}>
            <MaterialIcons name="event" size={64} color="#5B4BDB" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.rowTop}>
            <Text style={styles.categoria}>{evento.categoria}</Text>
            <Text style={styles.precio}>{evento.precio}</Text>
          </View>

          <Text style={styles.titulo}>{evento.titulo}</Text>

          <Dato icono="event" etiqueta="Fecha">
            {evento.fecha}
            {evento.hora ? ` · ${evento.hora}` : ""}
          </Dato>

          <Dato icono="place" etiqueta="Lugar">
            {evento.lugar}
          </Dato>

          {evento.organizador ? (
            <Dato icono="mic" etiqueta="Organizador">
              {evento.organizador}
            </Dato>
          ) : null}

          {evento.descripcion ? (
            <Dato icono="notes" etiqueta="Descripción">
              {evento.descripcion}
            </Dato>
          ) : null}
        </View>
      </ScrollView>

      {/* Botones fijos abajo */}
      <View style={[styles.pie, { paddingBottom: insets.bottom + 12 }]}>
        {/* Acción principal: ir al sitio oficial para entradas */}
        {evento.enlace ? (
          <TouchableOpacity
            style={styles.botonPrincipal}
            onPress={abrirEnlace}
            activeOpacity={0.85}
          >
            <MaterialIcons name="confirmation-number" size={20} color="#FFF" />
            <Text style={styles.botonPrincipalTexto}>Conseguir entradas</Text>
          </TouchableOpacity>
        ) : null}

        {/* Fila inferior: Recordarme (con correo) y Mapa */}
        <View style={styles.filaAcciones}>
          {puedeGuardarRecordatorio ? (
            <TouchableOpacity
              style={[
                styles.botonSecundario,
                recordatorioEnviado && styles.botonSecundarioActivo,
                procesando && styles.botonDeshabilitado,
              ]}
              onPress={activarRecordatorioCorreo}
              disabled={procesando || recordatorioEnviado}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={
                  recordatorioEnviado
                    ? "notifications-active"
                    : "notifications-none"
                }
                size={20}
                color={recordatorioEnviado ? "#2E7D32" : "#5B4BDB"}
              />
              <Text
                style={[
                  styles.botonSecundarioText,
                  recordatorioEnviado && { color: "#2E7D32" },
                ]}
              >
                {procesando
                  ? "Enviando..."
                  : recordatorioEnviado
                    ? "Recordatorio enviado"
                    : "Recordarme"}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={abrirMapa}
            activeOpacity={0.85}
          >
            <MaterialIcons name="map" size={20} color="#5B4BDB" />
            <Text style={styles.botonSecundarioText}>Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  barraSuperior: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accionesGestion: { flexDirection: "row", gap: 8 },
  botonCircular: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: 240 },
  sinImagen: {
    backgroundColor: "#E0DDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 20 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoria: { fontSize: 13, fontWeight: "700", color: "#5B4BDB" },
  precio: { fontSize: 13, fontWeight: "700", color: "#2E7D32" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 8 },
  etiquetaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  label: { fontSize: 13, color: "#777" },
  valor: { fontSize: 16, color: "#222", marginTop: 4, lineHeight: 22 },
  pie: {
    padding: 16,
    gap: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  botonPrincipal: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#5B4BDB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botonActivo: { backgroundColor: "#2E7D32" },
  botonDeshabilitado: { opacity: 0.6 },
  botonRecordar: { flex: 0 },
  botonPrincipalTexto: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  filaAcciones: { flexDirection: "row", gap: 10 },
  botonSecundario: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#5B4BDB",
  },
  botonSecundarioText: { color: "#5B4BDB", fontWeight: "600", fontSize: 14 },
  botonSecundarioActivo: {
  borderColor: "#2E7D32",
  backgroundColor: "#E8F5E9",
},
});