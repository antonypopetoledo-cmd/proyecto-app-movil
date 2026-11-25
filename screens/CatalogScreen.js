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
import { INTERESES, obtenerNombreCategoria } from "../data/categorias";

function EventCard({
  evento,
  esFavorito,
  onToggleFavorito,
  onPress,
  esAdmin,
  esRecomendado,
}) {
  const categoriaLimpia = obtenerNombreCategoria(evento.categoria);
  const esGratis =
    !evento.precio ||
    evento.precio.toLowerCase().includes("gratis") ||
    evento.precio === "0" ||
    evento.precio === "S/ 0";

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

        {esRecomendado && (
          <View style={styles.badgeRecomendado}>
            <Text style={styles.badgeRecomendadoText}>✨ Para ti</Text>
          </View>
        )}

        {!esAdmin && (
          <TouchableOpacity
            style={styles.favButton}
            onPress={() => onToggleFavorito(evento.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favIcon}>{esFavorito ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.rowTop}>
          <Text style={styles.categoria}>{categoriaLimpia}</Text>
          <View
            style={[styles.precioBadge, esGratis && styles.precioGratisBadge]}
          >
            <Text style={[styles.precio, esGratis && styles.precioGratisText]}>
              {esGratis ? "Gratis" : evento.precio}
            </Text>
          </View>
        </View>

        <Text style={styles.titulo} numberOfLines={2}>
          {evento.titulo}
        </Text>

        <Text style={styles.detalle}>
          📅 {mostrarFechaCorta(evento.fecha)}
          {evento.hora ? ` · ${evento.hora}` : ""}
        </Text>
        <Text style={styles.detalle} numberOfLines={1}>
          📍 {evento.lugar}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen({ navigation, sesion }) {
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

  const toggleFavorito = async (id) => {
    try {
      const evento = eventos.find((item) => item.id === id);
      await alternarFavorito(id, evento?.titulo);
    } catch (e) {
      Alert.alert(
        "Favoritos",
        "No se pudo guardar el favorito. Intenta nuevamente.",
      );
    }
  };

  // Muestra "Todos" + tus 7 categorías limpias (o solo las que tienen eventos)
  const categorias = useMemo(() => {
    const nombresExistentes = new Set(
      eventos.map((e) => obtenerNombreCategoria(e.categoria))
    );
    const ordenadas = INTERESES.map((c) => obtenerNombreCategoria(c.id)).filter(
      (labelConEmoji) => nombresExistentes.has(labelConEmoji)
    );
    return ["Todos", ...ordenadas];
  }, [eventos]);

  const misInteresesNormalizados = useMemo(() => {
    const interesesIds = sesion?.intereses || route.params?.intereses || [];
    return interesesIds.map((id) => obtenerNombreCategoria(id));
  }, [sesion?.intereses, route.params?.intereses]);

  const eventosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const esPasado = (evento) => {
      if (!evento.fechaInicio) return false;
      const fecha = new Date(evento.fechaInicio);
      return !isNaN(fecha.getTime()) && fecha < hoy;
    };

    const filtrados = eventos.filter((e) => {
      const catEvento = obtenerNombreCategoria(e.categoria);
      const coincideTexto =
        !texto ||
        e.titulo?.toLowerCase().includes(texto) ||
        e.lugar?.toLowerCase().includes(texto) ||
        catEvento.toLowerCase().includes(texto);

      const coincideCategoria =
        categoria === "Todos" || catEvento === categoria;

      return coincideTexto && coincideCategoria;
    });

    return [...filtrados].sort((a, b) => {
      // 1. Primero los eventos vigentes, al final los que ya pasaron
      const aPasado = esPasado(a);
      const bPasado = esPasado(b);
      if (!aPasado && bPasado) return -1;
      if (aPasado && !bPasado) return 1;

      // 2. Dentro de los vigentes (si está en "Todos"), prioriza los intereses del usuario
      if (categoria === "Todos" && misInteresesNormalizados.length > 0) {
        const aEsInteres = misInteresesNormalizados.includes(
          obtenerNombreCategoria(a.categoria)
        );
        const bEsInteres = misInteresesNormalizados.includes(
          obtenerNombreCategoria(b.categoria)
        );
        if (aEsInteres && !bEsInteres) return -1;
        if (!aEsInteres && bEsInteres) return 1;
      }
      return 0;
    });
  }, [eventos, busqueda, categoria, misInteresesNormalizados]);

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
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const esRecomendado =
            categoria === "Todos" &&
            misInteresesNormalizados.includes(
              obtenerNombreCategoria(item.categoria),
            );

          return (
            <EventCard
              evento={item}
              esFavorito={favoritos.includes(item.id)}
              onToggleFavorito={toggleFavorito}
              esAdmin={esAdmin}
              esRecomendado={esRecomendado}
              onPress={() =>
                navigation.navigate("DetalleEvento", { evento: item })
              }
            />
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={recargar} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.mensajeVacio}>No se encontraron eventos</Text>
            {(busqueda !== "" || categoria !== "Todos") && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setBusqueda("");
                  setCategoria("Todos");
                }}
              >
                <Text style={styles.clearFilterText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
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
            <Text style={styles.mensajeError}>
              {errorFavoritos} Toca para reintentar.
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre, distrito o lugar..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusqueda("")}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
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
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#5B4BDB",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  headerSubtitle: { fontSize: 14, color: "#E0DDFF", marginTop: 4 },
  filtros: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 6 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E4F0",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#222",
  },
  clearBtn: { padding: 4 },
  clearBtnText: { color: "#888", fontSize: 16, fontWeight: "bold" },
  chipsScroll: { paddingBottom: 6 },
  chip: {
    paddingVertical: 7,
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
  list: { paddingHorizontal: 15, paddingTop: 6, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: "100%", height: 160 },
  sinImagen: {
    backgroundColor: "#E0DDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sinImagenIcono: { fontSize: 48 },
  badgeRecomendado: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(91, 75, 219, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRecomendadoText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  favButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  favIcon: { fontSize: 18 },
  info: { padding: 14 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoria: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5B4BDB",
    letterSpacing: 0.4,
  },
  precioBadge: {
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  precioGratisBadge: { backgroundColor: "#E8F5E9" },
  precio: { fontSize: 12, fontWeight: "700", color: "#5B4BDB" },
  precioGratisText: { color: "#2E7D32" },
  titulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E1E2D",
    marginBottom: 6,
  },
  detalle: { fontSize: 13, color: "#666", marginTop: 2 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mensaje: { marginTop: 10, fontSize: 14, color: "#555", textAlign: "center" },
  mensajeError: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#5B4BDB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  mensajeVacio: { fontSize: 15, color: "#666", fontWeight: "600" },
  clearFilterBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0DDFF",
  },
  clearFilterText: { color: "#5B4BDB", fontWeight: "700", fontSize: 13 },
});
