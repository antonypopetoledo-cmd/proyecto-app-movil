import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import useSolicitudes from "../hooks/useSolicitudes";
import { obtenerNombreCategoria } from "../data/categorias";

const FILTROS_ESTADO = ["Todos", "Pendientes", "Aprobados", "Rechazados"];

export default function MisPublicacionesScreen({ sesion, navigation }) {
  const {
    pendientes,
    aprobados,
    rechazados,
    eliminarSolicitud,
    loading,
    error,
    reintentar,
  } = useSolicitudes(sesion);

  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const propias = useMemo(() => {
    const todas = [...pendientes, ...aprobados, ...rechazados]
      .filter((item) => item.creador === sesion?.email)
      .filter(
        (item, index, lista) =>
          lista.findIndex((otro) => otro.id === item.id) === index,
      );

    if (filtroEstado === "Pendientes") {
      return todas.filter(
        (i) => i.estado !== "aprobado" && i.estado !== "rechazado",
      );
    }
    if (filtroEstado === "Aprobados") {
      return todas.filter((i) => i.estado === "aprobado");
    }
    if (filtroEstado === "Rechazados") {
      return todas.filter((i) => i.estado === "rechazado");
    }
    return todas;
  }, [pendientes, aprobados, rechazados, sesion?.email, filtroEstado]);

  const obtenerInfoEstado = (item) => {
    if (item.estado === "aprobado") {
      return {
        texto: "Aprobado",
        badge: estilos.badgeAprobado,
        color: estilos.textoAprobado,
      };
    }
    if (item.estado === "rechazado") {
      return {
        texto: "Rechazado",
        badge: estilos.badgeRechazado,
        color: estilos.textoRechazado,
      };
    }
    return {
      texto: "Pendiente",
      badge: estilos.badgePendiente,
      color: estilos.textoPendiente,
    };
  };

  return (
    <View style={estilos.container}>
      <View style={estilos.header}>
        <Text style={estilos.headerTitle}>Mis publicaciones</Text>
        <Text style={estilos.headerSubtitle}>
          Revisa el estado de tus eventos enviados
        </Text>
      </View>

      {/* Chips de filtro por estado */}
      <View style={estilos.filtrosBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTROS_ESTADO.map((f) => (
            <TouchableOpacity
              key={f}
              style={[estilos.chip, filtroEstado === f && estilos.chipActivo]}
              onPress={() => setFiltroEstado(f)}
            >
              <Text
                style={[
                  estilos.chipTexto,
                  filtroEstado === f && estilos.chipTextoActivo,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#5B4BDB" />
      ) : null}

      {error ? (
        <TouchableOpacity onPress={reintentar}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            {error} Toca para reintentar.
          </Text>
        </TouchableOpacity>
      ) : null}

      {!loading && !error ? (
        <FlatList
          style={estilos.lista}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
          data={propias}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={estilos.contenedorVacio}>
              <View style={estilos.circuloIcono}>
                <MaterialIcons name="event-note" size={42} color="#5B4BDB" />
              </View>
              <Text style={estilos.textoVacio}>
                {filtroEstado === "Todos"
                  ? "Aún no tienes publicaciones"
                  : `No tienes eventos ${filtroEstado.toLowerCase()}`}
              </Text>
              <Text style={estilos.subtextoVacio}>
                Crea tu primer evento para que aparezca en la lista de la
                comunidad.
              </Text>
              <TouchableOpacity
                style={estilos.botonAccion}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("Publicar")}
              >
                <Text style={estilos.botonTexto}>Publicar un evento</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const infoEstado = obtenerInfoEstado(item);
            return (
              <View style={estilos.card}>
                <View style={estilos.rowTop}>
                  <Text style={estilos.categoria}>
                    {obtenerNombreCategoria(item.categoria)}
                  </Text>
                  <View style={[estilos.badgeBase, infoEstado.badge]}>
                    <Text style={[estilos.badgeTexto, infoEstado.color]}>
                      {infoEstado.texto}
                    </Text>
                  </View>
                </View>

                {/* Contenido principal con miniatura de flyer + datos */}
                <View style={estilos.cuerpoTarjeta}>
                  {item.imagen ? (
                    <Image
                      source={{ uri: item.imagen }}
                      style={estilos.miniatura}
                      contentFit="cover"
                      contentPosition={item.posicion || "center"}
                    />
                  ) : (
                    <View style={[estilos.miniatura, estilos.sinMiniatura]}>
                      <MaterialIcons name="event" size={28} color="#5B4BDB" />
                    </View>
                  )}

                  <View style={estilos.datosColumna}>
                    <Text style={estilos.nombre} numberOfLines={2}>
                      {item.titulo}
                    </Text>

                    <View style={estilos.datoFila}>
                      <MaterialIcons name="event" size={14} color="#666" />
                      <Text style={estilos.subtitulo}>
                        {item.fecha}
                        {item.hora ? ` · ${item.hora}` : ""}
                      </Text>
                    </View>

                    {item.lugar ? (
                      <View style={estilos.datoFila}>
                        <MaterialIcons name="place" size={14} color="#666" />
                        <Text style={estilos.subtitulo} numberOfLines={1}>
                          {item.lugar}
                        </Text>
                      </View>
                    ) : null}

                    <View style={estilos.datoFila}>
                      <MaterialIcons
                        name="local-offer"
                        size={14}
                        color="#2E7D32"
                      />
                      <Text style={estilos.precioTexto}>
                        {item.precio || "Gratis"}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.motivoRechazo ? (
                  <View style={estilos.motivoCaja}>
                    <Text style={estilos.motivo}>
                      Motivo: {item.motivoRechazo}
                    </Text>
                  </View>
                ) : null}

                <View style={estilos.barraAcciones}>
                  {item.estado === "rechazado" ? (
                    <TouchableOpacity
                      style={estilos.btnSecundario}
                      onPress={() =>
                        navigation.navigate("EditarSolicitud", {
                          solicitud: item,
                        })
                      }
                    >
                      <Text style={estilos.enlace}>Editar y reenviar</Text>
                    </TouchableOpacity>
                  ) : null}

                  {item.estado === "pendiente" ? (
                    <TouchableOpacity
                      style={estilos.btnPeligro}
                      onPress={() =>
                        Alert.alert(
                          "Cancelar solicitud",
                          "¿Cancelar esta solicitud?",
                          [
                            { text: "No" },
                            {
                              text: "Cancelar",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  await eliminarSolicitud(item.id);
                                } catch (e) {
                                  Alert.alert(
                                    "Error",
                                    "No se pudo cancelar la solicitud.",
                                  );
                                }
                              },
                            },
                          ],
                        )
                      }
                    >
                      <Text style={estilos.textoCancelar}>
                        Cancelar solicitud
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {item.estado === "aprobado" ? (
                    <TouchableOpacity
                      style={estilos.btnSecundario}
                      onPress={() =>
                        navigation.navigate("DetalleEvento", { evento: item })
                      }
                    >
                      <Text style={estilos.enlace}>Ver detalles</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#5B4BDB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0DDFF",
    marginTop: 4,
  },
  filtrosBox: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#5B4BDB",
    marginRight: 8,
  },
  chipActivo: { backgroundColor: "#5B4BDB" },
  chipTexto: { color: "#5B4BDB", fontSize: 13, fontWeight: "600" },
  chipTextoActivo: { color: "#FFF" },
  lista: { flex: 1, paddingHorizontal: 15, paddingTop: 10 },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoria: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4BDB",
  },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAprobado: { backgroundColor: "#E8F5E9" },
  badgePendiente: { backgroundColor: "#FFF8E1" },
  badgeRechazado: { backgroundColor: "#FFEBEE" },
  badgeTexto: { fontSize: 12, fontWeight: "700" },
  textoAprobado: { color: "#2E7D32" },
  textoPendiente: { color: "#C47A00" },
  textoRechazado: { color: "#D32F2F" },
  cuerpoTarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  miniatura: {
    width: 78,
    height: 78,
    borderRadius: 10,
    backgroundColor: "#EEE",
  },
  sinMiniatura: {
    backgroundColor: "#E0DDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  datosColumna: {
    flex: 1,
  },
  nombre: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1E1E2D",
    marginBottom: 4,
  },
  datoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  subtitulo: { fontSize: 13, color: "#666", flex: 1 },
  precioTexto: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  motivoCaja: {
    marginTop: 10,
    backgroundColor: "#FFF5F5",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#D32F2F",
  },
  motivo: { color: "#555", fontSize: 13 },
  barraAcciones: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F5",
  },
  btnSecundario: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F0EEFF",
    alignItems: "center",
  },
  btnPeligro: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
  },
  enlace: { color: "#5B4BDB", fontWeight: "700", fontSize: 13 },
  textoCancelar: { color: "#D32F2F", fontWeight: "700", fontSize: 13 },
  contenedorVacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  circuloIcono: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E0DDFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
    textAlign: "center",
    marginBottom: 8,
  },
  subtextoVacio: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  botonAccion: {
    backgroundColor: "#5B4BDB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#5B4BDB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});