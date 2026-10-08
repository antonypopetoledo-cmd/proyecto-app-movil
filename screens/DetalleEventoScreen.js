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

export default function DetalleEventoScreen({ route, navigation }) {
  const { evento } = route.params;
  const [recordatorio, setRecordatorio] = useState(false);

  const toggleRecordatorio = () => {
    setRecordatorio(!recordatorio);
    Alert.alert(
      recordatorio ? "Recordatorio quitado" : "Recordatorio activado",
      evento.titulo
    );
  };

  const abrirMapa = () => {
    const query = encodeURIComponent(evento.lugar);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: evento.imagen }}
          style={styles.image}
          contentFit="cover"
          contentPosition={evento.posicion || "center"}
        />

        <View style={styles.content}>
          <View style={styles.rowTop}>
            <Text style={styles.categoria}>{evento.categoria}</Text>
            <Text style={styles.precio}>{evento.precio}</Text>
          </View>

          <Text style={styles.titulo}>{evento.titulo}</Text>

          <Text style={styles.label}>📅 Fecha</Text>
          <Text style={styles.valor}>
            {evento.fecha}
            {evento.hora ? ` · ${evento.hora}` : ""}
          </Text>

          <Text style={styles.label}>📍 Lugar</Text>
          <Text style={styles.valor}>{evento.lugar}</Text>

          <TouchableOpacity style={styles.botonSecundario} onPress={abrirMapa}>
            <Text style={styles.botonSecundarioText}>🗺️ Ver en Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boton, recordatorio && styles.botonActivo]}
            onPress={toggleRecordatorio}
          >
            <Text style={styles.botonText}>
              {recordatorio ? "🔔 Recordatorio activado" : "🔔 Recordarme"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botonSecundarioText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  image: { width: "100%", height: 240 },
  content: { padding: 20 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoria: { fontSize: 13, fontWeight: "700", color: "#5B4BDB" },
  precio: { fontSize: 13, fontWeight: "700", color: "#2E7D32" },
  titulo: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 16 },
  label: { fontSize: 13, color: "#777", marginTop: 10 },
  valor: { fontSize: 16, color: "#222", marginTop: 2 },
  boton: {
    backgroundColor: "#5B4BDB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  botonActivo: { backgroundColor: "#2E7D32" },
  botonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  botonSecundario: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#5B4BDB",
  },
  botonSecundarioText: { color: "#5B4BDB", fontWeight: "600" },
});