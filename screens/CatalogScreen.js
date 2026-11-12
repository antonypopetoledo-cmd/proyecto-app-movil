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
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import useEventos from "../hooks/useEventos";
import useFavoritos from "../hooks/useFavoritos";
import { mostrarFechaCorta } from "../utils/fechaEvento";

const TRADUCCION_CATEGORIAS = {
  kpop: "K-pop",
  conciertos: "Conciertos",
  teatro: "Teatro",
  arte: "Arte y Cultura",
  tecnologia: "Tecnología",
  gaming: "Gaming",
  anime: "Anime",
  emprendimiento: "Emprendimiento",
  universitarios: "Eventos universitarios",
  gastronomia: "Ferias gastronómicas",
  deportes: "Deportes",
  festivales: "Festivales",
};

function EventCard({ evento, esFavorito, onToggleFavorito, onPress, esAdmin }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View>
        {evento.imagen ? (
          <Image
            source={{ uri: evento.imagen }}
            style={styles.image}
            contentFit="cover"
            contentPosition={evento.posicion || "center"}
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.sinImagen]}>
            <Text style={styles.sinImagenIcono}>🎉</Text>
          </View>
        )}

        {/* Solo muestra el corazón si NO es administrador */}
        {!esAdmin && (
          <TouchableOpacity
            style={styles.favButton}
            onPress={() => onToggleFavorito(evento.id)}
          >
            <Text style={styles.favIcon}>{esFavorito ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.rowTop}>
          <Text style={styles.categoria}>{evento.categoria}</Text>
          <Text style={styles.precio}>{evento.precio}</Text>
        </View>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.detalle}>
          {mostrarFechaCorta(evento.fecha)}
          {evento.hora ? ` · ${evento.hora}` : ""}
        </Text>
        <Text style={styles.detalle}>{evento.lugar}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen({ navigation, sesion }) {
  // Verifica si el usuario tiene rol de administrador
  const esAdmin = sesion?.rol === "administrador";
  const { eventos, loading, refreshing, error, recargar, reintentar } =
    useEventos(sesion);

  const route = useRoute();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const {
    favoritos,
    cargandoFavoritos,
    errorFavoritos,
    alternarFavorito,
    reintentarFavoritos,
  } = useFavoritos(esAdmin ? null : sesion?.uid);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const toggleFavorito = async (id) => {
    try {
      await alternarFavorito(id);
    } catch (e) {
      Alert.alert(
        "Favoritos",
        "No se pudo guardar el favorito. Intenta nuevamente.",
      );
    }
  };

  const categorias = useMemo(
    () => ["Todos", ...new Set(eventos.map((e) => e.categoria))],
    [eventos],
  );

  const eventosFiltrados = useMemo(() => {
    const interesesIds = sesion?.intereses || [];

    const misInteresesTexto = interesesIds.map(
      (id) => TRADUCCION_CATEGORIAS[id] || id,
    );

    const filtrados = eventos.filter((e) => {
      const coincideTexto =
        e.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.lugar.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoria === "Todos" || e.categoria === categoria;
      const coincideFav = esAdmin || !soloFavoritos || favoritos.includes(e.id);
      return coincideTexto && coincideCategoria && coincideFav;
    });

    if (categoria === "Todos") {
      return [...filtrados].sort((a, b) => {
        const limpiar = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

        const aEsInteres = misInteresesTexto.some((interesText) =>
          limpiar(a.categoria).includes(limpiar(interesText)),
        );
        const bEsInteres = misInteresesTexto.some((interesText) =>
          limpiar(b.categoria).includes(limpiar(interesText)),
        );

        if (aEsInteres && !bEsInteres) return -1;
        if (!aEsInteres && bEsInteres) return 1;
        return 0;
      });
    }

    return filtrados;
  }, [
    eventos,
    busqueda,
    categoria,
    soloFavoritos,
    favoritos,
    sesion,
    route.params?.intereses,
    esAdmin,
  ]);

  const renderContenido = () => {
    if (loading || (!esAdmin && cargandoFavoritos)) {
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
            esAdmin={esAdmin}
            onPress={() =>
              navigation.navigate("DetalleEvento", { evento: item })
            }
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
        <Text style={styles.headerTitle}>Eventos en Lima</Text>
        <Text style={styles.headerSubtitle}>
          Descubre qué hacer cerca de ti
        </Text>
      </View>

      <View style={styles.filtros}>
        {!esAdmin && errorFavoritos ? (
          <TouchableOpacity onPress={reintentarFavoritos}>
            <Text style={styles.mensaje}>
              {errorFavoritos} Toca para reintentar.
            </Text>
          </TouchableOpacity>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre o lugar..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Solo muestra el chip de Favoritos si NO es administrador */}
          {!esAdmin && (
            <TouchableOpacity
              style={[styles.chip, soloFavoritos && styles.chipActivo]}
              onPress={() => setSoloFavoritos(!soloFavoritos)}
            >
              <Text
                style={[styles.chipText, soloFavoritos && styles.chipTextActivo]}
              >
                ❤️ Favoritos
              </Text>
            </TouchableOpacity>
          )}

          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, categoria === cat && styles.chipActivo]}
              onPress={() => setCategoria(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  categoria === cat && styles.chipTextActivo,
                ]}
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
  list: { paddingHorizontal: 15, paddingTop: 2, paddingBottom: 20 },
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
  categoria: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4BDB",
    marginBottom: 4,
  },
  titulo: { fontSize: 17, fontWeight: "bold", color: "#222", marginBottom: 4 },
  detalle: { fontSize: 13, color: "#777" },
  precio: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  filtros: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 10 },
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
  favIcon: { fontSize: 16, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mensaje: { marginTop: 10, color: "#555", fontSize: 16 },
  mensajeVacio: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: "#5B4BDB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
});
