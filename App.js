import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import InterestsScreen from './screens/InterestsScreen';
import DetalleEventoScreen from './screens/DetalleEventoScreen';
import PestanasPrincipales from './navigation/PestanasPrincipales';
import EditarEventoScreen from './screens/EditarEventoScreen';
import MisPublicacionesScreen from './screens/MisPublicacionesScreen';
import EditarSolicitudScreen from './screens/EditarSolicitudScreen';
import { inicializarAuth, suscribirSesion, obtenerSesion } from './services/authService';
import { inicializarSolicitudes } from './services/solicitudesService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [cargado, setCargado] = useState(false);
  useEffect(() => {
    Promise.all([inicializarAuth(), inicializarSolicitudes()]).then(([sesionInicial]) => {
      setSesion(sesionInicial);
      setCargado(true);
    });
    return suscribirSesion(() => obtenerSesion().then(setSesion));
  }, []);
  if (!cargado) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color="#5B4BDB" /></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={sesion ? "Principal" : "Login"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Intereses" component={InterestsScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
