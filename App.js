import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enviarCorreoConfirmacion } from './services/emailService';
import LoginScreen from './screens/LoginScreen';
import InterestsScreen from './screens/InterestsScreen';
import DetalleEventoScreen from './screens/DetalleEventoScreen';
import PestanasPrincipales from './navigation/PestanasPrincipales';
import EditarEventoScreen from './screens/EditarEventoScreen';
import EditarSolicitudScreen from './screens/EditarSolicitudScreen';
import { inicializarAuth, suscribirSesion, obtenerSesion } from './services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let activo = true;
    inicializarAuth()
      .then((sesionInicial) => {
        if (activo) setSesion(sesionInicial);
      })
      .catch((e) => console.log("Error al iniciar:", e.message))
      .finally(() => { if (activo) setCargado(true); });

    const desuscribir = suscribirSesion(() => {
      obtenerSesion().then((s) => {
        if (activo) setSesion(s);
      });
    });
    return () => { activo = false; desuscribir && desuscribir(); };
  }, []);

  if (!cargado) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color="#5B4BDB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!sesion ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !sesion.interesesListo ? (
          <Stack.Screen name="Intereses" component={InterestsScreen} />
        ) : (
          <>
            <Stack.Screen name="Principal">
              {(props) => <PestanasPrincipales {...props} sesion={sesion} />}
            </Stack.Screen>
            <Stack.Screen name="DetalleEvento">
              {(props) => <DetalleEventoScreen {...props} sesion={sesion} />}
            </Stack.Screen>
            <Stack.Screen name="EditarEvento">
              {(props) => <EditarEventoScreen {...props} sesion={sesion} />}
            </Stack.Screen>
            <Stack.Screen name="EditarSolicitud">
              {(props) => <EditarSolicitudScreen {...props} sesion={sesion} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
