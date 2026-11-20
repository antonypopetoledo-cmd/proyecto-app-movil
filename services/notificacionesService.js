import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

const CANAL_FAVORITOS = "favoritos";

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

  if (Platform.OS !== "android" || Constants.appOwnership === "expo") return false;

  try {
    await Notifications.setNotificationChannelAsync(CANAL_FAVORITOS, {
      name: "Favoritos",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    return true;
  } catch (e) {
    if (__DEV__) console.warn("No se pudo crear el canal de notificaciones:", e?.message);
    return false;
  }
};

const tienePermiso = (permisos) =>
  permisos.granted ||
  permisos.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

export const notificarFavorito = async (tituloEvento) => {
  if (Platform.OS === "web") return;

  try {
    const canalDisponible = await configurarNotificaciones();

    let permisos = await Notifications.getPermissionsAsync();
    if (!tienePermiso(permisos)) {
      permisos = await Notifications.requestPermissionsAsync();
    }

    if (!tienePermiso(permisos)) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Evento guardado",
        body: `Añadiste ${tituloEvento || "este evento"} a favoritos.`,
        data: { tipo: "favorito" },
      },
      trigger: canalDisponible ? { channelId: CANAL_FAVORITOS } : null,
    });
  } catch (e) {
    // Las notificaciones no deben impedir guardar el favorito.
    if (__DEV__) console.warn("No se pudo mostrar la notificación:", e?.message);
  }
};
