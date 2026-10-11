import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PublicarScreen() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.mensaje}>Publicar eventos está en desarrollo.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FF',
  },
  mensaje: { fontSize: 16, color: '#555' },
});
