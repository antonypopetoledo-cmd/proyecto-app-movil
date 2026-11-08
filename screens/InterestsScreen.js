import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { guardarIntereses } from '../services/authService';
import { INTERESES } from '../data/categorias';

export default function InterestsScreen() {
  const [seleccionados, setSeleccionados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const toggleInteres = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Al guardar, App.js detecta el cambio en la sesión y pasa a la pantalla principal
  const guardar = async (lista) => {
    setGuardando(true);
    const resultado = await guardarIntereses(lista);
    if (!resultado.ok) {
      setGuardando(false);
      Alert.alert('No se pudo guardar', resultado.mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué te interesa?</Text>
        <Text style={styles.subtitle}>
          Elige tus categorías favoritas para personalizar tus recomendaciones
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {INTERESES.map((item) => {
          const activo = seleccionados.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, activo && styles.chipActivo]}
              onPress={() => toggleInteres(item.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.contador}>
          {seleccionados.length} seleccionado{seleccionados.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.button, (seleccionados.length === 0 || guardando) && styles.buttonDisabled]}
          onPress={() => guardar(seleccionados)}
          activeOpacity={0.8}
          disabled={seleccionados.length === 0 || guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => guardar([])} disabled={guardando}>
          <Text style={styles.skip}>Omitir por ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FF', paddingTop: 50 },
  header: { paddingHorizontal: 25, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#777', lineHeight: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 10,
  },
  chipActivo: {
    backgroundColor: '#5B4BDB',
    borderColor: '#5B4BDB',
  },
  chipText: { fontSize: 14, color: '#444', fontWeight: '600' },
  chipTextActivo: { color: '#FFF' },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  contador: { textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 10 },
  button: {
    backgroundColor: '#5B4BDB',
    paddingVertical: 15,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: '#C7C0F0' },
  buttonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  skip: { textAlign: 'center', color: '#5B4BDB', marginTop: 14, fontSize: 14 },
});