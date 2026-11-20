import { Platform, ToastAndroid } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";

const CANAL_FAVORITOS = "favoritos";
const esExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const configurarNotificaciones = async () => {
  if (Platform.OS === "web") return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS !== "android" || esExpoGo) return false;

  try {
    await Notifications.setNotificationChannelAsync(CANAL_FAVORITOS, {
      name: "Favoritos",
      importance: Notifications.AndroidImportance.HIGH,
    });
    return true;
  } catch (e) {
    return false;
  }
};

const tienePermiso = (permisos) =>
  permisos.granted ||
  permisos.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

export const notificarFavorito = async (tituloEvento) => {
  if (Platform.OS === "web") return;

  const titulo = "❤️ Evento guardado";
  const mensaje = `Añadiste "${tituloEvento || "este evento"}" a tus favoritos.`;

  try {
    const canalDisponible = await configurarNotificaciones();

    let permisos = await Notifications.getPermissionsAsync();
    if (!tienePermiso(permisos)) {
      permisos = await Notifications.requestPermissionsAsync();
    }

    if (!tienePermiso(permisos)) return;

    // En Expo Go Android (SDK 58), los canales nativos están limitados:
    // mostramos aviso nativo inmediato y en el APK real sale la notificación completa.
    if (Platform.OS === "android" && esExpoGo) {
      ToastAndroid.show(`${titulo}: ${mensaje}`, ToastAndroid.SHORT);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: mensaje,
        data: { tipo: "favorito" },
      },
      trigger: canalDisponible ? { channelId: CANAL_FAVORITOS } : null,
    });
  } catch (e) {
    if (Platform.OS === "android") {
      ToastAndroid.show(`${titulo}: ${mensaje}`, ToastAndroid.SHORT);
    }
  }
};