import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import useEventos from "../hooks/useEventos";
import useFavoritos from "../hooks/useFavoritos";

export default function FavoritosScreen({ navigation, sesion }) {
  const { eventos, loading, refreshing, error, recargar, reintentar } =
    useEventos(sesion);
  const {
    favoritos,
    cargandoFavoritos,
    errorFavoritos,
    alternarFavorito,
    reintentarFavoritos,
  } = useFavoritos(sesion?.uid);

  const eventosFavoritos = useMemo(
    () => eventos.filter((e) => favoritos.includes(e.id)),
    [eventos, favoritos],
  );

  const quitarFavorito = async (id) => {
    try {
      await alternarFavorito(id);
    } catch (e) {
      Alert.alert("Favoritos", "No se pudo actualizar tus favoritos.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis favoritos</Text>
        <Text style={styles.headerSubtitle}>
          Eventos que guardaste para más tarde
        </Text>
      </View>

      {loading || cargandoFavoritos ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5B4BDB" />
          <Text style={styles.mensaje}>Cargando favoritos...</Text>
        </View>
      ) : error || errorFavoritos ? (
        <View style={styles.center}>
          <Text style={styles.mensaje}>{error || errorFavoritos}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={error ? reintentar : reintentarFavoritos}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={eventosFavoritos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={recargar} />
          }
          ListEmptyComponent={
            <View style={styles.vacioContainer}>
              <MaterialIcons name="favorite-border" size={56} color="#C7C0F0" />
              <Text style={styles.vacioTitulo}>Aún no tienes favoritos</Text>
              <Text style={styles.vacioTexto}>
                Toca el corazón en cualquier evento para guardarlo aquí.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("DetalleEvento", { evento: item })
              }
            >
              <View>
                {item.imagen ? (
                  <Image
                    source={{ uri: item.imagen }}
                    style={styles.image}
                    contentFit="cover"
                    contentPosition={item.posicion || "center"}
                    transition={200}
                  />
                ) : (
                  <View style={[styles.image, styles.sinImagen]}>
                    <Text style={styles.sinImagenIcono}>🎉</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.favButton}
                  onPress={() => quitarFavorito(item.id)}
                >
                  <Text style={styles.favIcon}>❤️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.info}>
                <View style={styles.rowTop}>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                  <Text style={styles.precio}>{item.precio}</Text>
                </View>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.detalle}>
                  {item.fecha}
                  {item.hora ? ` · ${item.hora}` : ""}
                </Text>
                <Text style={styles.detalle}>{item.lugar}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  header: { padding: 20, paddingTop: 50, backgroundColor: "#5B4BDB" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSubtitle: { fontSize: 14, color: "#E0DDFF", marginTop: 4 },
  list: { padding: 15, flexGrow: 1 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: "100%", height: 150 },
  sinImagen: {
    backgroundColor: "#E0DDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sinImagenIcono: { fontSize: 48 },
  info: { padding: 14 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoria: { fontSize: 12, fontWeight: "700", color: "#5B4BDB" },
  precio: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  titulo: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 4 },
  detalle: { fontSize: 13, color: "#777" },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  favIcon: { fontSize: 16, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mensaje: { marginTop: 10, color: "#555", fontSize: 16, textAlign: "center" },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#5B4BDB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  vacioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 60,
  },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 14,
  },
  vacioTexto: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
