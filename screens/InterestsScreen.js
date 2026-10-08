import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const INTERESES = [
  { id: 'kpop', label: '💃 K-pop / Danza' },
  { id: 'conciertos', label: '🎵 Conciertos' },
  { id: 'teatro', label: '🎭 Teatro' },
  { id: 'arte', label: '🎨 Arte y Cultura' },
  { id: 'tecnologia', label: '💻 Tecnología' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'anime', label: '🍥 Anime' },
  { id: 'emprendimiento', label: '🧑‍💼 Emprendimiento' },
  { id: 'universitarios', label: '🎓 Eventos universitarios' },
  { id: 'gastronomia', label: '🍔 Ferias gastronómicas' },
  { id: 'deportes', label: '⚽ Deportes' },
  { id: 'festivales', label: '🎉 Festivales' },
];

export default function InterestsScreen({ navigation }) {
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleInteres = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const continuar = () => {
    navigation.replace('Catalogo', { intereses: seleccionados });
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
          style={[styles.button, seleccionados.length === 0 && styles.buttonDisabled]}
          onPress={continuar}
          activeOpacity={0.8}
          disabled={seleccionados.length === 0}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={continuar}>
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
  },
  buttonDisabled: { backgroundColor: '#C7C0F0' },
  buttonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  skip: { textAlign: 'center', color: '#5B4BDB', marginTop: 14, fontSize: 14 },
});