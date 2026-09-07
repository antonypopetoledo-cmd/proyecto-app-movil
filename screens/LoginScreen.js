import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
    } else if (!email.includes("@")) {
      setError("El correo debe tener un formato válido");
    } else if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
    } else {
      setError("");
      Alert.alert(
        "Bienvenido a LimaGo",
        "Tu cuenta ha sido creada exitosamente.",
      );
      navigation.replace("Intereses");
    }
  };

  const iniciarSesion = () => {
    if (!email || !password) {
      Alert.alert(
        "Campos incompletos",
        "Ingresa tu correo y contraseña para iniciar sesión.",
      );
    } else if (!email.includes("@")) {
      Alert.alert("Correo inválido", "Ingresa un correo con formato válido.");
    } else {
      navigation.replace("Intereses");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>LimaGo</Text>
        <Text style={styles.subtitle}>
          Descubre lo que está pasando en Lima
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>¡Únete a LimaGo!</Text>
        <Text style={styles.description}>
          Encuentra eventos, experiencias y actividades cerca de ti según tus
          intereses.
        </Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={validateForm}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>o</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={iniciarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Eventos y experiencias en Lima</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FF",
    justifyContent: "center",
    padding: 20,
  },
  header: { alignItems: "center", marginBottom: 25 },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#5B4BDB",
    letterSpacing: 1,
  },
  subtitle: { fontSize: 15, color: "#555", marginTop: 5, textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 25, fontWeight: "bold", color: "#222", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#777",
    marginBottom: 22,
    lineHeight: 20,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 7 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 15,
    color: "#222",
  },
  button: {
    backgroundColor: "#5B4BDB",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  orText: { marginHorizontal: 12, color: "#999", fontSize: 14 },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#5B4BDB",
    paddingVertical: 13,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#5B4BDB",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: { color: "#E53935", fontSize: 13, marginBottom: 10 },
  footerText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 20,
  },
});
