import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import InterestsScreen from './screens/InterestsScreen';
import DetalleEventoScreen from './screens/DetalleEventoScreen';
import PestanasPrincipales from './navigation/PestanasPrincipales';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Intereses" component={InterestsScreen} />
        <Stack.Screen name="Principal" component={PestanasPrincipales} />
        <Stack.Screen name="DetalleEvento" component={DetalleEventoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
