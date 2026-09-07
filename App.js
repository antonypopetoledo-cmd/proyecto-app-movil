import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import CatalogScreen from './screens/CatalogScreen';
import InterestsScreen from './screens/InterestsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Intereses" component={InterestsScreen} />
        <Stack.Screen name="Catalogo" component={CatalogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}