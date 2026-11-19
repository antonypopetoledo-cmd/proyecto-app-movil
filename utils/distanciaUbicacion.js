const RADIO_TIERRA_METROS = 6371000;

const gradosARadianes = (grados) => (grados * Math.PI) / 180;

export const coordenadasValidas = (coordenadas) => {
  if (!coordenadas) return false;
  const { latitude, longitude } = coordenadas;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const calcularDistanciaMetros = (origen, destino) => {
  if (!coordenadasValidas(origen) || !coordenadasValidas(destino)) return null;

  const diferenciaLatitud = gradosARadianes(destino.latitude - origen.latitude);
  const diferenciaLongitud = gradosARadianes(destino.longitude - origen.longitude);
  const latitudOrigen = gradosARadianes(origen.latitude);
  const latitudDestino = gradosARadianes(destino.latitude);
  const mitadCuerda =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(latitudOrigen) *
      Math.cos(latitudDestino) *
      Math.sin(diferenciaLongitud / 2) ** 2;
  const distanciaAngular = 2 * Math.atan2(Math.sqrt(mitadCuerda), Math.sqrt(1 - mitadCuerda));

  return RADIO_TIERRA_METROS * distanciaAngular;
};

export const formatearDistancia = (metros) => {
  if (!Number.isFinite(metros)) return "";
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
};
