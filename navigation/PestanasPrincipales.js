import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CatalogScreen from '../screens/CatalogScreen';
import PublicarScreen from '../screens/PublicarScreen';

const Pestanas = createBottomTabNavigator();

export default function PestanasPrincipales() {
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
    </Pestanas.Navigator>
  );
}
