import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { actualizarPerfil, cerrarSesion } from "../services/authService";
import { INTERESES } from "../data/categorias";

export default function PerfilScreen({ sesion }) {
  const esAdmin = sesion?.rol === "administrador";
  const [nombre, setNombre] = useState(sesion?.nombre || "");
  const [apellido, setApellido] = useState(sesion?.apellido || "");
  const [intereses, setIntereses] = useState(sesion?.intereses || []);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const interesesGuardados = sesion?.intereses || [];

  // El botón Guardar solo se activa cuando hay algo distinto a lo ya guardado
  const hayCambios = useMemo(() => {
    const mismosIntereses =
      intereses.length === interesesGuardados.length &&
      intereses.every((id) => interesesGuardados.includes(id));
    return (
      nombre.trim() !== (sesion?.nombre || "") ||
      apellido.trim() !== (sesion?.apellido || "") ||
      !mismosIntereses
    );
  }, [nombre, apellido, intereses, sesion]);

  const iniciales =
    `${(sesion?.nombre || "?")[0]}${(sesion?.apellido || "")[0] || ""}`.toUpperCase();

  const toggleInteres = (id) =>
    setIntereses((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const guardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      setError("El nombre y el apellido son obligatorios.");
      return;
    }
    setError("");
    setGuardando(true);
    const resultado = await actualizarPerfil({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      intereses,
    });
    setGuardando(false);
    if (!resultado.ok) {
      Alert.alert("No se pudo guardar", resultado.mensaje);
      return;
    }
    Alert.alert(
      "Perfil actualizado",
      "Tus cambios se guardaron correctamente.",
    );
  };

  const salir = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          try {
            await cerrarSesion();
          } catch (e) {
            Alert.alert("Error", "No se pudo cerrar sesión.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciales}</Text>
        </View>
        <Text style={styles.headerNombre}>
          {`${sesion?.nombre || ""} ${sesion?.apellido || ""}`.trim() ||
            "Mi perfil"}
        </Text>
        <Text style={styles.headerCorreo}>{sesion?.email}</Text>

        <View style={[styles.badgeRol, esAdmin && styles.badgeRolAdmin]}>
          <MaterialIcons
            name={esAdmin ? "admin-panel-settings" : "person"}
            size={14}
            color="#FFF"
          />
          <Text style={styles.badgeRolTexto}>
            {esAdmin ? "Administrador" : "Usuario"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu apellido"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={apellido}
          onChangeText={setApellido}
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, styles.inputBloqueado]}
          value={sesion?.email}
          editable={false}
        />

        <Text style={[styles.label, styles.tituloIntereses]}>
          Mis intereses
        </Text>
        <View style={styles.grid}>
          {INTERESES.map((item) => {
            const activo = intereses.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => toggleInteres(item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, activo && styles.chipTextActivo]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.button,
            (!hayCambios || guardando) && styles.buttonDisabled,
          ]}
          onPress={guardar}
          disabled={!hayCambios || guardando}
          activeOpacity={0.8}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCerrarSesion}
          onPress={salir}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={20} color="#E53935" />
          <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FF" },
  header: {
    backgroundColor: "#5B4BDB",
    paddingTop: 50,
    paddingBottom: 22,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarTexto: { fontSize: 26, fontWeight: "bold", color: "#5B4BDB" },
  headerNombre: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  headerCorreo: { fontSize: 13, color: "#E0DDFF", marginTop: 2 },
  badgeRol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  badgeRolAdmin: {
    backgroundColor: "rgba(255, 215, 0, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.6)",
  },
  badgeRolTexto: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  contenido: { padding: 20, paddingBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 7 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 15,
    color: "#222",
  },
  inputBloqueado: { backgroundColor: "#EEE", color: "#777" },
  tituloIntereses: { marginTop: 5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  chipActivo: { backgroundColor: "#5B4BDB", borderColor: "#5B4BDB" },
  chipText: { fontSize: 14, color: "#444", fontWeight: "600" },
  chipTextActivo: { color: "#FFF" },
  error: { color: "#E53935", fontSize: 13, marginBottom: 10 },
  button: {
    backgroundColor: "#5B4BDB",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#C7C0F0" },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonCerrarSesion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E53935",
    backgroundColor: "#FFF",
  },
  cerrarSesion: {
    color: "#E53935",
    fontSize: 15,
    fontWeight: "700",
  },
});
