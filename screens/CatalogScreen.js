import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from 'expo-image';

const EVENTOS_MOCK = [
  {
    id: "1",
    titulo: "Testing Day Perú 2026 – 2.ª Edición",
    categoria: "💻 Tecnología",
    fecha: "18–19 sep",
    hora: null,
    lugar: "Escuela de Postgrado UTP, San Isidro",
    precio: "Por confirmar",
    imagen:
      "https://images.lumacdn.com/uploads/ud/78bc442f-1751-44ad-8030-f70a9f7a6a29.png",
    posicion: 'center',
  },
  {
    id: "2",
    titulo: "aespa – LIVE TOUR 2026–27",
    categoria: "💗 K-pop",
    fecha: "9 sep",
    hora: null,
    lugar: "Costa 21, San Isidro",
    precio: "Según zona",
    imagen:
      "https://static.wikia.nocookie.net/kpop-and-idols/images/8/80/%F0%93%86%A9%E0%BC%A2%E0%BF%94%E0%BE%80%E0%AB%81%E2%9D%80%E2%9C%AF%E2%81%96%E2%84%98.jpeg/revision/latest?cb=20241026025900",
    posicion: 'top',
  },
  {
    id: "3",
    titulo: "Metro Gamer Fest 2026",
    categoria: "🎮 Gaming",
    fecha: "19–20 sep",
    hora: "2:00 p. m. – 9:00 p. m.",
    lugar: "Metro San Juan de Lurigancho – Hacienda",
    precio: "Gratis",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6lr1-hAvJcLnXM7Z7300tWWNlFQUti3UVSsmxor4iBQ0-x6_6gDIwKEwA&s=10",
    posicion: 'top',
  },
  {
    id: "4",
    titulo: "Anime Fest Lima 2026",
    categoria: "🍥 Anime",
    fecha: "8 sep",
    hora: "10:00 a. m.",
    lugar: "Lima Expo, Cercado de Lima",
    precio: "S/15",
    imagen:
      "https://blogbagatela.wordpress.com/wp-content/uploads/2019/10/71860223_2875087599185318_5924745773802586112_n.jpg",
  },
];

function EventCard({ evento }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Image
        source={{ uri: evento.imagen }}
        style={styles.image}
        contentFit="cover"
        contentPosition={evento.posicion || 'center'}
        transition={200}
      />
      <View style={styles.info}>
        <View style={styles.rowTop}>
          <Text style={styles.categoria}>{evento.categoria}</Text>
          <Text style={styles.precio}>{evento.precio}</Text>
        </View>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.detalle}>
          {evento.fecha}
          {evento.hora ? ` · ${evento.hora}` : ''}
        </Text>
        <Text style={styles.detalle}>{evento.lugar}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen({ navigation }) {
  const cerrarSesion = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
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

      <FlatList
        data={EVENTOS_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard evento={item} />}
        contentContainerStyle={styles.list}
      />
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
  logoutText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  precio: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
});
