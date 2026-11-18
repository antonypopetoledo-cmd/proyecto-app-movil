# Lima Go 🎭

Aplicación móvil para la publicación, gestión y difusión de eventos en Lima Metropolitana. Reúne en un solo lugar actividades culturales, tecnológicas, gastronómicas y recreativas (con énfasis en opciones gratuitas) y permite que organizadores publiquen sus eventos para que otros los descubran.

**Curso:** Desarrollo de Aplicaciones Móviles · **Docente:** David William Cota Sencara · **Sección:** 32835  
**Carrera:** Ingeniería de Sistemas e Informática · Universidad Tecnológica del Perú (UTP)

---

## Integrantes y distribución del equipo

- **Alburqueque Melgarejo, Jamie (Jay)** — *Autenticación y seguridad (`feature/auth`)*
  - Configuración inicial del proyecto en Firebase (`firebaseConfig`).
  - Registro de usuarios con validaciones (nombre, apellido, correo y contraseña con longitud mínima y número).
  - Inicio de sesión (con opción para mostrar/ocultar contraseña), cierre de sesión persistente y recuperación de contraseña por correo.
  - Control de acceso por roles (`usuario` y `administrador`) en navegación, interfaz y reglas de Firestore.
  - Sistema de recordatorios de eventos (1 semana, 3 días y 1 día antes) y pruebas del flujo completo en dispositivo.

- **Huaman Licla, Brandon** — *Persistencia y estadísticas (`feature/persistencia`)*
  - Migración de eventos, solicitudes y favoritos a Cloud Firestore con suscripciones en tiempo real (`onSnapshot`), manejo de errores (`try/catch`) y estados de carga.
  - Gestión de asistencias por evento (`registrarAsistencia(uid, eventoId)` en subcolección `asistencias`).
  - Pantalla de **Estadísticas** para el administrador: conteo de eventos por categoría, asistentes totales y categoría con mayor demanda.

- **Pope Toledo, Jhon Antony** — *Servicio externo y perfil (`feature/servicio-externo`)*
  - Flujo de confirmación de asistencia mediante el botón **"Asistiré"** en el detalle del evento.
  - Integración con servicio externo **EmailJS** (`@emailjs/react-native`) para el envío automático de correos de confirmación.
  - Pantalla de **Perfil**: visualización de datos de sesión y edición de nombre, apellido e intereses personales.
  - Documentación técnica del proyecto (`README.md`).

---

## Objetivo del Avance 3 (APF3)

Consolidar la aplicación con persistencia real en la nube, autenticación segura y servicios externos:

- **Autenticación real (30%)** con Firebase Authentication, recuperación de contraseña, persistencia de sesión y control de roles.
- **Persistencia de datos en BD en tiempo real (30%)** con Cloud Firestore (`eventos`, `usuarios`, `favoritos`, `solicitudes`, `asistencias`) y reglas de seguridad (`firestore.rules`).
- **Integración con servicio externo (20%)** mediante EmailJS para notificaciones de asistencia por correo electrónico.
- **Flujo funcional completo (20%)** cubriendo el ciclo de vida de publicación, moderación (aprobación/rechazo con motivo), edición y eliminación de eventos.

---

## Prototipo de diseño

Figma: [Ver diseño en Figma](https://www.figma.com/design/i8R0n1Ib4vVBKbJTFnSGT1/LimaGo?node-id=0-1&t=jaunEBU5tWa8YnDn-1)

---

## Tecnologías

- **React Native 0.86 + Expo SDK 57**
- **React Navigation 7** (`native-stack` y `bottom-tabs`)
- **Firebase** (`firebase/auth` y `firebase/firestore`)
- **EmailJS** (`@emailjs/react-native`)
- **Expo Vector Icons** (`@expo/vector-icons`), `expo-image` y `@react-native-community/datetimepicker`

---

## Instalación y ejecución

Requisitos: [Node.js](https://nodejs.org) (LTS) y la app **Expo Go** en tu celular, o un emulador Android/iOS.

```bash
# 1. Clonar el repositorio
git clone https://github.com/antonypopetoledo-cmd/proyecto-app-movil.git
cd proyecto-app-movil

# 2. Instalar dependencias
npm install

# 3. Iniciar el proyecto
npx expo start
```

Luego escanea el código QR con **Expo Go**, o presiona `a` (Android) / `i` (iOS) en la terminal. Si necesitas limpiar la caché de Metro, ejecuta `npx expo start -c`.

---

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Usuario | jamieam1103@gmail.com | jay123456 |
| Usuario | brandon09@gmail.com | ... |
| Usuario | antonypopetoledo@gmail.com | .... |
| Administrador | admin@gmail.com | admin123 |

*(También puedes registrar una cuenta nueva desde la pantalla de inicio; por seguridad en Firestore, todo registro nuevo se crea con el rol `usuario`).*

---

## Funcionalidades principales

### Para el Usuario (`rol: "usuario"`)
- **Autenticación completa:** Registro con validaciones, inicio de sesión con botón para ver/ocultar contraseña, persistencia de sesión y recuperación de clave.
- **Personalización:** Selección de intereses iniciales que priorizan dinámicamente los eventos recomendados en el catálogo.
- **Exploración y filtros:** Búsqueda por nombre o lugar, filtro por categorías, filtro de favoritos y ordenamiento cronológico por fecha próxima.
- **Gestión de favoritos:** Guardado y sincronización en tiempo real en Firestore.
- **Asistencia y correo:** Confirmación de asistencia desde el detalle del evento con envío automático de correo de confirmación vía EmailJS y recordatorios programados.
- **Publicación de eventos:** Formulario con selector nativo de fecha y hora; las publicaciones pasan a revisión del administrador y pueden consultarse/corregirse en **Mis publicaciones**.
- **Perfil:** Edición de nombre, apellido e intereses en tiempo real.

### Para el Administrador (`rol: "administrador"`)
- **Interfaz adaptada al rol:** Se ocultan los botones y filtros de favoritos en el catálogo para mantener una vista limpia de gestión, y se reorganiza la barra inferior (`Eventos`, `Estadísticas`, `Publicar`, `Solicitudes` con badge de pendientes y `Perfil`).
- **Publicación directa:** Los eventos creados por el administrador se publican al instante en el catálogo sin pasar por cola de aprobación.
- **Moderación de solicitudes:** Revisión de eventos enviados por usuarios con opción de **Aceptar** (publica en `eventos`) o **Rechazar** ingresando un motivo de corrección.
- **CRUD de eventos:** Edición completa de eventos existentes (con cabecera fijada, retroceso, enlaces visibles desde el inicio y actualización inmediata en pantalla) y eliminación segura desde el detalle.
- **Dashboard de Estadísticas:** Visualización de métricas globales de eventos por categoría, asistentes confirmados y categorías destacadas.

---

## Flujo de la aplicación

```text
Login (Ver contraseña / Recuperar clave / Registro)
  └──► Selección de intereses (primera vez)
         └──► Pestañas principales (según rol)
                ├──► Eventos (Catálogo ordenado por fecha + intereses)
                │      └──► Detalle del evento
                │             ├──► Usuario: Favorito · Asistiré (EmailJS) · Recordatorio · Mapa
                │             └──► Admin: Editar evento (actualización inmediata) · Eliminar
                ├──► Favoritos (Usuario) / Estadísticas (Admin)
                ├──► Publicar (+) (Solicitud para Usuario / Directo para Admin)
                ├──► Mis publicaciones (Usuario) / Solicitudes con badge (Admin)
                └──► Perfil (Editar datos e intereses · Cerrar sesión)
```

---

## Estructura del proyecto

```text
proyecto-app-movil/
├── assets/          # iconos, splash e imágenes
├── data/            # catálogo base (eventos.json) y lista de categorías/intereses
├── docs/            # documentación de persistencia y arquitectura en Firestore
├── hooks/           # hooks personalizados (useEventos, useSolicitudes, useFavoritos)
├── navigation/      # barra de navegación inferior adaptada por rol (PestanasPrincipales.js)
├── screens/         # pantallas (Login, Interests, Catalog, DetalleEvento, Publicar, EditarEvento, EditarSolicitud, Solicitudes, MisPublicaciones, Favoritos, Estadisticas, Perfil)
├── scripts/         # utilidades de carga inicial a Firestore
├── services/        # lógica de Firebase y servicios externos (authService, eventosService, solicitudesService, favoritosService, asistenciasService, emailService, firebaseConfig)
├── tests/           # pruebas unitarias y de validación
├── utils/           # formateo de fechas y utilidades (fechaEvento.js)
├── firestore.rules  # reglas de seguridad de Cloud Firestore por rol y UID
├── App.js           # navegación raíz (Stack) y control de sesión
└── app.json         # configuración de Expo
```

---

## Seguridad y manejo de errores

- **Reglas de Firestore (`firestore.rules`):** Protegen la integridad de los datos verificando `request.auth != null` y la función `esAdmin()`. Impiden que un usuario se auto-asigne el rol `administrador` al registrarse o editar su perfil, y restringen la escritura directa en `eventos` y la aprobación de `solicitudes` exclusivamente al administrador.
- **Manejo de errores y UX:** Todas las operaciones asíncronas cuentan con bloques `try/catch`, bloqueo de botones durante el guardado para evitar envíos duplicados, indicadores de carga (`ActivityIndicator`) y opciones de reintento ante fallos de red.

---

## Licencia

Ver el archivo [LICENSE](LICENSE).
