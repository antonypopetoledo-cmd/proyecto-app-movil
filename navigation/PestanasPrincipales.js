import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import CatalogScreen from '../screens/CatalogScreen';
import PublicarScreen from '../screens/PublicarScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import MisPublicacionesScreen from '../screens/MisPublicacionesScreen';
import useSolicitudes from '../hooks/useSolicitudes';

const Pestanas = createBottomTabNavigator();

export default function PestanasPrincipales({ sesion }) {
  const { pendientes } = useSolicitudes(sesion);

  return (
    <Pestanas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5B4BDB',
        tabBarInactiveTintColor: '#777',
        tabBarShowLabel: false,
      }}
    >
      <Pestanas.Screen name="Eventos" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-month" color={color} size={size} /> }}>
        {(props) => <CatalogScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>
      <Pestanas.Screen name="Publicar" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle-outline" color={color} size={size} /> }}>
        {(props) => <PublicarScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>
      {sesion?.rol === "usuario" ? <Pestanas.Screen name="Mis publicaciones" options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="article" color={color} size={size} /> }}>
        {(props) => <MisPublicacionesScreen {...props} sesion={sesion} />}
      </Pestanas.Screen> : null}
      {sesion?.rol === "administrador" ? <Pestanas.Screen name="Solicitudes" options={{ tabBarBadge: pendientes.length || undefined, tabBarIcon: ({ color, size }) => <MaterialIcons name="fact-check" color={color} size={size} /> }}>
        {(props) => <SolicitudesScreen {...props} sesion={sesion} />}
      </Pestanas.Screen> : null}
    </Pestanas.Navigator>
  );
}
