# Lima Go 🎭

Aplicación móvil para la publicación y difusión de eventos en Lima Metropolitana (culturales, tecnológicos, gastronómicos y recreativos).

**Curso:** Desarrollo de Aplicaciones Móviles · **Docente:** David William Cota Sencara · **Sección:** 32835  
**Carrera:** Ingeniería de Software · Universidad Tecnológica del Perú (UTP)

---

## Integrantes y distribución del equipo

- **Alburqueque Melgarejo, Jamie (Jay)** — *Autenticación, seguridad, cámara y UI/UX (`feature/auth` · `feature/camara-perfil`)*: Configuración de Firebase y `firestore.rules`, autenticación completa (ver contraseña, sesión persistente y recuperación), control de roles, foto de perfil con `expo-image-picker`, recordatorios y optimización visual/UX general (fechas cortas, ordenamiento y depuración de flujos).
- **Huaman Licla, Brandon** — *Persistencia, estadísticas y GPS (`feature/persistencia` · `feature/gps-mapa-detalle`)*: Cloud Firestore en tiempo real (`onSnapshot`), gestión de asistencias, geolocalización GPS (`expo-location`), mapa interactivo (`react-native-maps`) con cálculo de distancia y panel de estadísticas.
- **Pope Toledo, Jhon Antony** — *Servicios externos y multimedia (`feature/servicio-externo` · `feature/multimedia-publicar`)*: Confirmación "Asistiré", notificaciones con EmailJS (bienvenida y asistencia), carga de flyers desde galería/cámara, pantalla de perfil y documentación (`README.md`).

---

## Objetivo del Avance 3 (APF3)

Consolidar la aplicación integrando persistencia en la nube, autenticación segura, servicios externos y hardware nativo:

- **Autenticación real (30%)** con Firebase Authentication, recuperación de clave, sesión persistente y roles.
- **Persistencia en tiempo real (30%)** con Cloud Firestore (`eventos`, `usuarios`, `favoritos`, `solicitudes`, `asistencias`) y reglas de seguridad.
- **Servicios externos (20%)** mediante EmailJS para correos transaccionales.
- **Flujo completo y hardware nativo (20%)** con subida multimedia, moderación, CRUD y geolocalización GPS.

---

## Prototipo, Tecnologías y Ejecución

- **Figma:** [Ver diseño en Figma](https://www.figma.com/design/i8R0n1Ib4vVBKbJTFnSGT1/LimaGo?node-id=0-1&t=jaunEBU5tWa8YnDn-1)
- **Stack:** React Native 0.88, Expo SDK 58, React Navigation 7, Firebase (Auth/Firestore) y EmailJS.
- **Permisos nativos:** `expo-image-picker` (Cámara y Galería), `expo-location` (GPS) y `react-native-maps`.

```bash
git clone https://github.com/antonypopetoledo-cmd/proyecto-app-movil.git
cd proyecto-app-movil
npm install
npx expo start
```

---

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Usuario | jamieam1103@gmail.com | jay123456 |
| Usuario | brandon09@gmail.com | ... |
| Usuario | antonypopetoledo@gmail.com | .... |
| Administrador | admin@gmail.com | admin123 |

*(Los registros nuevos se crean con rol `usuario`).*

---

## Funcionalidades principales

- **Para Usuarios:** Autenticación con bienvenida por correo (EmailJS), personalización de intereses, exploración y filtros de catálogo, favoritos sincronizados en Firestore, mapa interactivo con distancia GPS, botón "Asistiré" con notificación, publicación multimedia de eventos (`expo-image-picker`) y perfil con foto.
- **Para Administradores:** Vista adaptada de gestión, publicación directa sin cola de revisión, moderación de solicitudes (aceptar/rechazar con motivo), CRUD completo de eventos y dashboard de estadísticas.

---

## Flujo, Estructura y Seguridad

La arquitectura del proyecto abarca navegación por roles (`App.js`), reglas de Firestore (`firestore.rules`), manejo explícito de permisos nativos con alertas y bloques `try/catch` en servicios asíncronos. Para consultar la estructura completa de carpetas (`assets/`, `data/`, `hooks/`, `navigation/`, `screens/`, `services/`, etc.) y detalles de seguridad, revisa el repositorio fuente.

---

## Licencia

Ver el archivo [LICENSE](LICENSE).