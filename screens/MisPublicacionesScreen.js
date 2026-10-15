import React from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useSolicitudes from "../hooks/useSolicitudes";

export default function MisPublicacionesScreen({ sesion, navigation }) {
  const { pendientes, aprobados, rechazados, eliminarSolicitud } = useSolicitudes(sesion);
  const propias = [...pendientes, ...aprobados, ...rechazados]
    .filter((item) => item.creador === sesion?.email)
    .filter((item, index, lista) => lista.findIndex((otro) => otro.id === item.id) === index);
  const estado = (item) => item.estado === "aprobado" ? "Aprobado" : item.estado === "rechazado" ? "Rechazado" : "Pendiente de revisión";
  
  return (
    <View style={estilos.container}>
      {/* CABECERA CON EL COLOR MORADO INSTITUCIONAL */}
      <View style={estilos.header}>
        <Text style={estilos.headerTitle}>Mis publicaciones</Text>
        <Text style={estilos.headerSubtitle}>Revisa el estado de tus eventos enviados</Text>
      </View>

      <FlatList 
        style={estilos.lista} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }} 
        data={propias} 
        keyExtractor={(item) => item.id} 
        ListEmptyComponent={
          <View style={estilos.contenedorVacio}>
            <View style={estilos.circuloIcono}>
              <Text style={estilos.iconoTexto}>✍️</Text>
            </View>
            <Text style={estilos.textoVacio}>Aún no tienes publicaciones</Text>
            <Text style={estilos.subtextoVacio}>
              Crea tu primer evento para que aparezca en la lista de la comunidad.
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
        renderItem={({ item }) => (
          <View style={estilos.card}>
            <Text style={estilos.nombre}>{item.titulo}</Text>
            <Text>{item.fecha} · {item.categoria}</Text>
            <Text style={item.estado === "rechazado" ? estilos.rechazado : estilos.estado}>{estado(item)}</Text>
            {item.motivoRechazo ? <Text style={estilos.motivo}>Motivo: {item.motivoRechazo}</Text> : null}
            {item.estado === "rechazado" ? <TouchableOpacity onPress={() => navigation.navigate("EditarSolicitud", { solicitud: item })}><Text style={estilos.enlace}>Editar y reenviar</Text></TouchableOpacity> : null}
            {item.estado === "pendiente" ? <TouchableOpacity onPress={() => Alert.alert("Cancelar solicitud", "¿Cancelar esta solicitud?", [{ text: "No" }, { text: "Cancelar", style: "destructive", onPress: () => eliminarSolicitud(item.id) }])}><Text style={estilos.rechazado}>Cancelar solicitud</Text></TouchableOpacity> : null}
            {item.estado === "aprobado" ? <TouchableOpacity onPress={() => navigation.navigate("DetalleEvento", { evento: item })}><Text style={estilos.enlace}>Ver detalles</Text></TouchableOpacity> : null}
          </View>
        )} 
      />
    </View>
  );
}

const estilos = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  // NUEVO DISEÑO PARA LA CABECERA MORADA
  header: { 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: "#5B4BDB" 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#FFF" 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: "#E0DDFF", 
    marginTop: 4 
  },
  lista: { flex: 1, padding: 15 }, 
  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 12 }, 
  nombre: { fontWeight: "bold", fontSize: 17, marginBottom: 5 }, 
  estado: { color: "#C47A00", fontWeight: "bold", marginTop: 8 }, 
  rechazado: { color: "#D32F2F", fontWeight: "bold", marginTop: 8 }, 
  motivo: { color: "#555", marginTop: 8 }, 
  enlace: { color: "#5B4BDB", fontWeight: "bold", marginTop: 12 },
  contenedorVacio: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 30,
    paddingBottom: 80 
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
  iconoTexto: { fontSize: 36 },
  textoVacio: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#222222", 
    textAlign: "center",
    marginBottom: 8 
  },
  subtextoVacio: { 
    fontSize: 14, 
    color: "#777777", 
    textAlign: "center", 
    lineHeight: 20,
    marginBottom: 24 
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
    fontSize: 15 
  }
});
