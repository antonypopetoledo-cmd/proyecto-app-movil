import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import CatalogScreen from "../screens/CatalogScreen";
import FavoritosScreen from "../screens/FavoritosScreen";
import PublicarScreen from "../screens/PublicarScreen";
import SolicitudesScreen from "../screens/SolicitudesScreen";
import MisPublicacionesScreen from "../screens/MisPublicacionesScreen";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import useSolicitudes from "../hooks/useSolicitudes";
import PerfilScreen from "../screens/PerfilScreen";

const Pestanas = createBottomTabNavigator();

export default function PestanasPrincipales({ sesion }) {
  const { pendientes } = useSolicitudes(sesion);
  const esAdmin = sesion?.rol === "administrador";

  return (
    <Pestanas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5B4BDB",
        tabBarInactiveTintColor: "#777",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 65,
          borderTopWidth: 1,
          borderTopColor: "#EAEAEA",
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        },
      }}
    >
      {/* 1. Izquierda: Eventos (Todos) */}
      <Pestanas.Screen
        name="Eventos"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" color={color} size={size} />
          ),
        }}
      >
        {(props) => <CatalogScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>

      {/* 2. Centro-Izquierda: Estadísticas (Admin) o Favoritos (Usuario) */}
      {esAdmin ? (
        <Pestanas.Screen
          name="Estadísticas"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="bar-chart" color={color} size={size} />
            ),
          }}
        >
          {(props) => <EstadisticasScreen {...props} sesion={sesion} />}
        </Pestanas.Screen>
      ) : (
        <Pestanas.Screen
          name="Favoritos"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="favorite" color={color} size={size} />
            ),
          }}
        >
          {(props) => <FavoritosScreen {...props} sesion={sesion} />}
        </Pestanas.Screen>
      )}

      {/* 3. Centro: Publicar (+) (Todos) */}
      <Pestanas.Screen
        name="Publicar"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="add-circle-outline"
              color={color}
              size={size}
            />
          ),
        }}
      >
        {(props) => <PublicarScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>

      {/* 4. Centro-Derecha: Solicitudes (Admin) o Mis publicaciones (Usuario) */}
      {esAdmin ? (
        <Pestanas.Screen
          name="Solicitudes"
          options={{
            tabBarBadge: pendientes.length || undefined,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="fact-check" color={color} size={size} />
            ),
          }}
        >
          {(props) => <SolicitudesScreen {...props} sesion={sesion} />}
        </Pestanas.Screen>
      ) : (
        <Pestanas.Screen
          name="Mis publicaciones"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="article" color={color} size={size} />
            ),
          }}
        >
          {(props) => <MisPublicacionesScreen {...props} sesion={sesion} />}
        </Pestanas.Screen>
      )}

      {/* 5. Extremo Derecho: Perfil (Todos) */}
      <Pestanas.Screen
        name="Perfil"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      >
        {(props) => <PerfilScreen {...props} sesion={sesion} />}
      </Pestanas.Screen>
    </Pestanas.Navigator>
  );
}
