# Lima Go 🎭

Aplicación móvil para la publicación, gestión y difusión de eventos en Lima Metropolitana. Reúne en un solo lugar actividades culturales, tecnológicas, gastronómicas y recreativas (con énfasis en opciones gratuitas) y permite que organizadores publiquen sus eventos para que otros los descubran.

**Curso:** Desarrollo de Aplicaciones Móviles · **Docente:** David William Cota Sencara · **Sección:** 32835
**Carrera:** Ingeniería de Sistemas e Informática · Universidad Tecnológica del Perú (UTP)

## Integrantes

- Alburqueque Melgarejo, Jamie
- Huaman Licla, Brandon
- Pope Toledo, Jhon Antony

## Objetivo del Avance 2

Implementar la base funcional de la aplicación aplicando:

- **Navegación** con React Navigation (Stack + Tab).
- **Hooks** (`useState`, `useEffect`, `useMemo`) y hooks personalizados.
- **Consumo de datos** con `fetch`, manejo de errores (`try/catch`) y estados de carga.
- **Interfaz** con componentes reutilizables (`FlatList`, `TextInput`, `TouchableOpacity`).
- **Roles**: los eventos publicados pasan por una moderación realizada por un administrador.

## Prototipo de diseño

Figma: _[PEGAR AQUÍ EL ENLACE]_

## Tecnologías

- React Native 0.86 + Expo SDK 57
- React Navigation 7 (`native-stack` y `bottom-tabs`)
- `@expo/vector-icons` (iconos de la barra inferior)
- `expo-image`

## Instalación y ejecución

Requisitos: [Node.js](https://nodejs.org) (LTS) y la app **Expo Go** en tu celular, o un emulador Android/iOS.

```bash
# 1. Clonar el repositorio
git clone https://github.com/antonypopetoledo-cmd/proyecto-app-movil.git
cd proyecto-app-movil

# 2. Instalar dependencias
npm install
npx expo install @expo/vector-icons

# 3. Iniciar el proyecto
npx expo start
```

Luego escanea el código QR con Expo Go, o presiona `a` (Android) / `i` (iOS) en la terminal. Si algo falla por la caché, usa `npx expo start -c`.

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Usuario | jhon@gmail.com | 12345678 |
| Administrador | admin@limago.com | admin1234 |

También puedes crear una cuenta nueva desde la pantalla de inicio (se registra como usuario).

## Funcionalidades

- Registro e inicio de sesión con validaciones.
- Selección de intereses.
- Catálogo de eventos con búsqueda por nombre o lugar y filtros por categoría.
- Favoritos.
- Detalle del evento con recordatorio.
- Publicación de eventos mediante formulario.
- Moderación: el **administrador** ve la pestaña **Solicitudes** y acepta o elimina las solicitudes pendientes. Las aceptadas aparecen en **Eventos**.

## Flujo de la aplicación

```
Login → Intereses → Pestañas principales ──► Detalle del evento
                    ├─ Eventos
                    ├─ Publicar
                    └─ Solicitudes (solo administrador)
```

## Estructura del proyecto

```
proyecto-app-movil/
├── assets/         # iconos e imágenes
├── data/           # eventos.json (datos locales)
├── hooks/          # useEventos, useSolicitudes
├── navigation/     # pestañas principales
├── screens/        # pantallas de la app
├── services/       # auth, eventos y solicitudes
├── App.js          # navegación principal (Stack)
└── app.json        # configuración de Expo
```

## Datos y manejo de errores

Los eventos se obtienen con `fetch` desde un JSON publicado en GitHub. Si la conexión falla, la app usa `data/eventos.json` como respaldo. Se muestran estados de **carga**, **error con reintento** y actualización por deslizamiento. En `services/eventosService.js`, la constante `SIMULAR_ERROR` permite probar la pantalla de error.

## Limitaciones actuales

- Usuarios, solicitudes y favoritos se guardan en memoria: se pierden al cerrar la app.
- Las notificaciones sobre eventos favoritos se implementarán en una etapa posterior.
- Se integrará una base de datos real en la siguiente etapa.

## Licencia

Ver el archivo [LICENSE](LICENSE).
