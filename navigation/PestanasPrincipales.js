import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
        },
      }}
    >
      <Pestanas.Screen name="Eventos">
        {(props) => <CatalogScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>
      <Pestanas.Screen name="Publicar">
        {(props) => <PublicarScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>
      {sesion?.rol === "usuario" ? <Pestanas.Screen name="Mis publicaciones">
        {(props) => <MisPublicacionesScreen {...props} sesion={sesion} />}
      </Pestanas.Screen> : null}
      {sesion?.rol === "administrador" ? <Pestanas.Screen name="Solicitudes" options={{ tabBarBadge: pendientes.length || undefined }}>
        {(props) => <SolicitudesScreen {...props} sesion={sesion} />}
      </Pestanas.Screen> : null}
    </Pestanas.Navigator>
  );
}
