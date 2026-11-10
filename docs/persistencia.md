# Persistencia de Lima Go

## Contrato compartido con Jay y Pope

- `usuarios/{uid}`: documento de perfil de Jay; `rol` solo lo asigna un administrador desde Firebase Console. No se modifica desde el cliente.
- `eventos/{id}`: catálogo público para usuarios autenticados; solo los administradores pueden crear, editar o eliminar eventos. Cada evento conserva `fechaInicio` como fecha local ISO, por ejemplo `2026-11-20T12:00:00`.
- `solicitudes/{id}`: `creadorUid`, `creador` (correo), `estado` (`pendiente`, `aprobado` o `rechazado`) y datos del evento. Un administrador aprueba y publica el evento con el mismo ID en una transacción.
- `usuarios/{uid}/favoritos/{eventoId}`: favoritos independientes por cuenta.
- `eventos/{eventoId}/asistencias/{uid}`: una asistencia por usuario y evento. `registrarAsistencia(uid, eventoId)` en `services/asistenciasService.js` devuelve `true` si la creó, `false` si ya existía y lanza un error si el evento no existe o falla Firestore. Pope debe llamar a esta función antes de enviar el correo; el correo solo corresponde al primer registro.

## Puesta en marcha

1. Jay completa `fechaInicio` en todos los elementos de `data/eventos.json`, crea el perfil de la cuenta admin y revisa/publica `firestore.rules` desde la consola o su entorno Firebase.
2. Un responsable con permisos administrativos ejecuta **una vez** `npm run importar:eventos` en su equipo, con `FIREBASE_PROJECT_ID` y `GOOGLE_APPLICATION_CREDENTIALS` definidos en su sesión de PowerShell. El archivo de credenciales queda fuera del repositorio. El script no sobrescribe eventos existentes y crea `importaciones/eventos-iniciales` al terminar.
3. Instalar/iniciar la app; al entrar con cada usuario se migran las solicitudes locales reales de ese dispositivo (no los ejemplos). Las ediciones/eliminaciones requieren iniciar sesión como administrador en el dispositivo original **después** de importar el catálogo. La migración es reintentable y no borra AsyncStorage; si no encuentra al organizador, primero se debe recrear su cuenta.
4. Verificar en dos dispositivos: favoritos compartidos por cuenta, solicitud pendiente → aprobación → catálogo/estadísticas y asistencia sin duplicación. La publicación de reglas y la importación remota no se realizan automáticamente al instalar la app.

Los favoritos antiguos solo existían en memoria y no se pueden recuperar tras cerrar la app. Las solicitudes aprobadas antiguas requieren que un administrador inicie sesión en el dispositivo que las conserva para migrarlas sin dar permisos de aprobación a usuarios comunes.
