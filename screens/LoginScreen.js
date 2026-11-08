import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  USUARIO_PRUEBA,
  registrarUsuario,
  iniciarSesionConCuenta,
  recuperarContrasena,
} from "../services/authService";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const esRegistro = modo === "registro";

  const cambiarModo = () => {
    setModo(esRegistro ? "login" : "registro");
    setError("");
  };

  const validarRegistro = () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password || !confirmar) {
      return "Todos los campos son obligatorios";
    }
    if (!REGEX_EMAIL.test(email.trim())) return "El correo debe tener un formato válido";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/\d/.test(password)) return "La contraseña debe incluir al menos un número";
    if (password !== confirmar) return "Las contraseñas no coinciden";
    return "";
  };

  const crearCuenta = async () => {
    const mensaje = validarRegistro();
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError("");
    setCargando(true);
    const resultado = await registrarUsuario({ nombre, apellido, email, password });
    setCargando(false);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    // App.js detecta la sesión y muestra la siguiente pantalla
    Alert.alert("Bienvenido a LimaGo", "Tu cuenta ha sido creada exitosamente.");
  };

  const iniciarSesion = async () => {
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña para iniciar sesión.");
      return;
    }
    if (!REGEX_EMAIL.test(email.trim())) {
      setError("Ingresa un correo con formato válido.");
      return;
    }
    setError("");
    setCargando(true);
    const resultado = await iniciarSesionConCuenta(email, password);
    setCargando(false);
    if (!resultado.ok) {
      Alert.alert(resultado.titulo, resultado.mensaje);
    }
  };

  const olvideContrasena = async () => {
    if (!REGEX_EMAIL.test(email.trim())) {
      Alert.alert("Recuperar contraseña", "Escribe tu correo arriba y vuelve a pulsar este enlace.");
      return;
    }
    const resultado = await recuperarContrasena(email);
    if (resultado.ok) {
      Alert.alert("Revisa tu correo", "Si la cuenta existe, te enviamos un enlace para crear una nueva contraseña.");
    } else {
      Alert.alert(resultado.titulo, resultado.mensaje);
    }
  };

  const usarCuentaDePrueba = () => {
    setEmail(USUARIO_PRUEBA.email);
    setPassword(USUARIO_PRUEBA.password);
    setError("");
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.logo}>LimaGo</Text>
        <Text style={styles.subtitle}>Descubre lo que está pasando en Lima</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{esRegistro ? "¡Únete a LimaGo!" : "Bienvenido de vuelta"}</Text>
        <Text style={styles.description}>
          {esRegistro
            ? "Crea tu cuenta para encontrar eventos y publicar los tuyos."
            : "Inicia sesión para ver los eventos que te interesan."}
        </Text>

        {esRegistro && (
          <>
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
          </>
        )}

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder={esRegistro ? "Mínimo 8 caracteres y un número" : "Tu contraseña"}
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {esRegistro && (
          <>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              value={confirmar}
              onChangeText={setConfirmar}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={esRegistro ? crearCuenta : iniciarSesion}
          activeOpacity={0.8}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</Text>
          )}
        </TouchableOpacity>

        {!esRegistro && (
          <>
            <TouchableOpacity onPress={olvideContrasena} activeOpacity={0.7}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={usarCuentaDePrueba} activeOpacity={0.7}>
              <Text style={styles.link}>Usar cuenta de prueba ({USUARIO_PRUEBA.email})</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
        </View>

        <TouchableOpacity onPress={cambiarModo} activeOpacity={0.7}>
          <Text style={styles.toggleText}>
            {esRegistro ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
            <Text style={styles.toggleAccion}>{esRegistro ? "Inicia sesión" : "Crea una"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#F4F6FF" },
  container: {
    flexGrow: 1,
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
    minHeight: 50,
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#C7C0F0" },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: { color: "#E53935", fontSize: 13, marginBottom: 10 },
  link: {
    textAlign: "center",
    color: "#5B4BDB",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  toggleText: { textAlign: "center", color: "#666", fontSize: 14 },
  toggleAccion: { color: "#5B4BDB", fontWeight: "700" },
});