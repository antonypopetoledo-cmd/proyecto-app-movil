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
  registrarUsuario,
  iniciarSesionConCuenta,
  recuperarContrasena,
} from "../services/authService";
import { MaterialIcons } from "@expo/vector-icons";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [confirmar, setConfirmar] = useState("");
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const esRegistro = modo === "registro";

  const cambiarModo = () => {
    setModo(esRegistro ? "login" : "registro");
    setError("");
    setVerContrasena(false);
    setVerConfirmar(false);
  };

  const validarRegistro = () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password ||
      !confirmar
    ) {
      return "Todos los campos son obligatorios";
    }
    if (!REGEX_EMAIL.test(email.trim()))
      return "El correo debe tener un formato válido";
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (!/\d/.test(password))
      return "La contraseña debe incluir al menos un número";
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
    const resultado = await registrarUsuario({
      nombre,
      apellido,
      email,
      password,
    });
    setCargando(false);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    Alert.alert(
      "Bienvenido a LimaGo",
      "Tu cuenta ha sido creada exitosamente.",
    );
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
      Alert.alert(
        "Recuperar contraseña",
        "Escribe tu correo arriba y vuelve a pulsar este enlace.",
      );
      return;
    }
    const resultado = await recuperarContrasena(email);
    if (resultado.ok) {
      Alert.alert(
        "Revisa tu correo",
        "Si la cuenta existe, te enviamos un enlace para crear una nueva contraseña.",
      );
    } else {
      Alert.alert(resultado.titulo, resultado.mensaje);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {esRegistro ? (
        <View style={styles.topBarRegistro}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={cambiarModo}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={22} color="#5B4BDB" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="local-activity" size={34} color="#5B4BDB" />
          </View>
          <Text style={styles.logo}>
            <Text style={styles.logoDark}>Lima</Text>Go
          </Text>
          <Text style={styles.subtitle}>
            Tu guía de eventos y planes en Lima
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>
          {esRegistro ? "¡Súmate a LimaGo!" : "¡Bienvenido de vuelta!"}
        </Text>
        <Text style={styles.description}>
          {esRegistro
            ? "Crea tu cuenta gratis y descubre los mejores planes cerca de ti."
            : "Inicia sesión para explorar eventos, guardar favoritos y más."}
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
        <View style={styles.inputIconContainer}>
          <MaterialIcons
            name="mail-outline"
            size={20}
            color="#888"
            style={styles.leftIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <MaterialIcons
            name="lock-outline"
            size={20}
            color="#888"
            style={styles.leftIcon}
          />
          <TextInput
            style={styles.passwordInput}
            placeholder={
              esRegistro ? "Mínimo 8 caracteres y un número" : "Tu contraseña"
            }
            placeholderTextColor="#999"
            secureTextEntry={!verContrasena}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setVerContrasena(!verContrasena)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={verContrasena ? "visibility" : "visibility-off"}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {esRegistro && (
          <>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.passwordContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color="#888"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.passwordInput}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!verConfirmar}
                autoCapitalize="none"
                value={confirmar}
                onChangeText={setConfirmar}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setVerConfirmar(!verConfirmar)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={verConfirmar ? "visibility" : "visibility-off"}
                  size={22}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
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
            <Text style={styles.buttonText}>
              {esRegistro ? "Crear cuenta" : "Iniciar sesión"}
            </Text>
          )}
        </TouchableOpacity>

        {!esRegistro && (
          <TouchableOpacity onPress={olvideContrasena} activeOpacity={0.7}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
        </View>

        <TouchableOpacity onPress={cambiarModo} activeOpacity={0.7}>
          <Text style={styles.toggleText}>
            {esRegistro ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
            <Text style={styles.toggleAccion}>
              {esRegistro ? "Inicia sesión" : "Crea una"}
            </Text>
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
  header: { alignItems: "center", marginBottom: 24 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EBE8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#5B4BDB",
    letterSpacing: 0.5,
  },
  logoDark: {
    color: "#222222",
  },
  subtitle: { fontSize: 15, color: "#555", marginTop: 4, textAlign: "center" },
  topBarRegistro: {
    width: "100%",
    marginTop: 25,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E6F5",
  },
  backText: {
    color: "#5B4BDB",
    fontSize: 15,
    fontWeight: "600",
  },
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
  title: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 6 },
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
  inputIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
    borderRadius: 10,
  },
  leftIcon: {
    paddingLeft: 14,
  },
  inputWithIcon: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#222",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
    marginBottom: 15,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#222",
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
  link: {
    color: "#5B4BDB",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    fontWeight: "600",
  },
  separatorContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#EAEAEA",
  },
  toggleText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  toggleAccion: {
    color: "#5B4BDB",
    fontWeight: "bold",
  },
  error: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
});
