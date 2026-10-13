import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CatalogScreen from '../screens/CatalogScreen';
import PublicarScreen from '../screens/PublicarScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import useSolicitudes from '../hooks/useSolicitudes';

const Pestanas = createBottomTabNavigator();

export default function PestanasPrincipales() {
  const { pendientes } = useSolicitudes();

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
      <Pestanas.Screen name="Eventos" component={CatalogScreen} />
      <Pestanas.Screen name="Publicar" component={PublicarScreen} />
      <Pestanas.Screen
        name="Solicitudes"
        component={SolicitudesScreen}
        options={{ tabBarBadge: pendientes.length || undefined }}
      />
    </Pestanas.Navigator>
  );
}