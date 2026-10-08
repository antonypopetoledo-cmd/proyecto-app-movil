import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import useEventos from "../hooks/useEventos";

function EventCard({ evento, esFavorito, onToggleFavorito }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View>
        <Image
          source={{ uri: evento.imagen }}
          style={styles.image}
          contentFit="cover"
          contentPosition={evento.posicion || "center"}
          transition={200}
        />
        <TouchableOpacity
          style={styles.favButton}
          onPress={() => onToggleFavorito(evento.id)}
        >
          <Text style={styles.favIcon}>{esFavorito ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <View style={styles.rowTop}>
          <Text style={styles.categoria}>{evento.categoria}</Text>
          <Text style={styles.precio}>{evento.precio}</Text>
        </View>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.detalle}>
          {evento.fecha}
          {evento.hora ? ` · ${evento.hora}` : ""}
        </Text>
        <Text style={styles.detalle}>{evento.lugar}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen({ navigation }) {
  const { eventos, loading, refreshing, error, recargar, reintentar } =
    useEventos();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [favoritos, setFavoritos] = useState([]);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const categorias = useMemo(
    () => ["Todos", ...new Set(eventos.map((e) => e.categoria))],
    [eventos]
  );

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((e) => {
      const coincideTexto =
        e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.lugar.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoria === "Todos" || e.categoria === categoria;
      const coincideFav = !soloFavoritos || favoritos.includes(e.id);
      return coincideTexto && coincideCategoria && coincideFav;
    });
  }, [eventos, busqueda, categoria, soloFavoritos, favoritos]);

  const renderContenido = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5B4BDB" />
          <Text style={styles.mensaje}>Cargando eventos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.mensaje}>😕 {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={reintentar}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={eventosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            evento={item}
            esFavorito={favoritos.includes(item.id)}
            onToggleFavorito={toggleFavorito}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={recargar} />
        }
        ListEmptyComponent={
          <Text style={styles.mensajeVacio}>No se encontraron eventos</Text>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Eventos en Lima</Text>
            <Text style={styles.headerSubtitle}>
              Descubre qué hacer cerca de ti
            </Text>
          </View>
          <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtros}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre o lugar..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.chip, soloFavoritos && styles.chipActivo]}
            onPress={() => setSoloFavoritos(!soloFavoritos)}
          >
            <Text style={[styles.chipText, soloFavoritos && styles.chipTextActivo]}>
              ❤️ Favoritos
            </Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, categoria === cat && styles.chipActivo]}
              onPress={() => setCategoria(cat)}
            >
              <Text
                style={[styles.chipText, categoria === cat && styles.chipTextActivo]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {renderContenido()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  header: { padding: 20, paddingTop: 50, backgroundColor: "#5B4BDB" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSubtitle: { fontSize: 14, color: "#E0DDFF", marginTop: 4 },
  list: { padding: 15 },
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
  info: { padding: 14 },
  categoria: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4BDB",
    marginBottom: 4,
  },
  titulo: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 4 },
  detalle: { fontSize: 13, color: "#777" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  logoutText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  precio: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },

  // Nuevos
  filtros: { paddingHorizontal: 15, paddingTop: 12 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
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
  chipText: { color: "#5B4BDB", fontWeight: "600", fontSize: 13 },
  chipTextActivo: { color: "#FFF" },
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
  favIcon: { fontSize: 18 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  mensaje: { marginTop: 10, fontSize: 15, color: "#555", textAlign: "center" },
  mensajeVacio: { textAlign: "center", color: "#777", marginTop: 30 },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#5B4BDB",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
});