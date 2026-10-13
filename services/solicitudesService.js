// Almacén compartido de solicitudes de eventos.
// - pendientes: solicitudes enviadas desde el formulario, esperando revisión.
// - aprobados: solicitudes aceptadas; se muestran en la página de Eventos.
// Los datos viven mientras la app esté abierta.

// Solicitudes de ejemplo: ya vienen cargadas para poder aceptarlas o eliminarlas.
const SOLICITUDES_EJEMPLO = [
  {
    id: "sol-demo-1",
    titulo: "Noche de Teatro Peruano",
    categoria: "🎭 Teatro",
    fecha: "7 nov",
    hora: "7:30 p. m.",
    lugar: "Teatro Municipal de Lima, Cercado de Lima",
    precio: "Desde S/ 25",
    imagen: null,
    posicion: "center",
    descripcion:
      "Función con obras cortas de autores peruanos y conversatorio con el elenco al finalizar.",
    organizador: "Colectivo Escena Viva",
    enlace: null,
  },
  {
    id: "sol-demo-2",
    titulo: "Feria Gastronómica Sabores de Lima",
    categoria: "🍔 Ferias gastronómicas",
    fecha: "14–15 nov",
    hora: "12:00 p. m. – 8:00 p. m.",
    lugar: "Parque de la Exposición, Cercado de Lima",
    precio: "Gratis",
    imagen: null,
    posicion: "center",
    descripcion:
      "Más de 40 stands de comida criolla, fusión y postres, con música en vivo durante la tarde.",
    organizador: "Asociación de Cocineros de Lima",
    enlace: null,
  },
  {
    id: "sol-demo-3",
    titulo: "Maratón Urbana 10K Lima",
    categoria: "⚽ Deportes",
    fecha: "22 nov",
    hora: "6:00 a. m.",
    lugar: "Costa Verde, Miraflores",
    precio: "S/ 60",
    imagen: null,
    posicion: "center",
    descripcion:
      "Carrera de 10 kilómetros frente al mar, con kit de corredor y medalla para quienes terminen.",
    organizador: "Club Runners Perú",
    enlace: null,
  },
  {
    id: "sol-demo-4",
    titulo: "Expo Arte Joven 2026",
    categoria: "🎨 Arte y Cultura",
    fecha: "28–30 nov",
    hora: "10:00 a. m. – 7:00 p. m.",
    lugar: "Centro Cultural de la PUCP, San Miguel",
    precio: "Entrada libre",
    imagen: null,
    posicion: "center",
    descripcion:
      "Muestra de pintura, ilustración y fotografía de artistas emergentes, con talleres abiertos al público.",
    organizador: null,
    enlace: null,
  },
];

let pendientes = [...SOLICITUDES_EJEMPLO];
let aprobados = [];
let contador = 0;
const oyentes = new Set();

const avisar = () => oyentes.forEach((fn) => fn());

export const suscribir = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};

export const getPendientes = () => pendientes;
export const getAprobados = () => aprobados;

export const enviarSolicitud = (datos) => {
  contador += 1;
  const solicitud = {
    id: `sol-${Date.now()}-${contador}`,
    titulo: datos.titulo.trim(),
    categoria: datos.categoria.trim(),
    fecha: datos.fecha.trim(),
    hora: datos.hora.trim() || null,
    lugar: datos.lugar.trim(),
    precio: datos.precio.trim() || "Por confirmar",
    imagen: datos.imagen.trim() || null,
    posicion: "center",
    descripcion: datos.descripcion.trim() || null,
    organizador: datos.organizador.trim() || null,
    enlace: datos.enlace.trim() || null,
  };
  pendientes = [solicitud, ...pendientes];
  avisar();
  return solicitud;
};

// Eliminar: la solicitud desaparece y no se añade a ningún lado.
export const eliminarSolicitud = (id) => {
  pendientes = pendientes.filter((s) => s.id !== id);
  avisar();
};

// Aceptar: sale de pendientes y se añade a la lista de eventos.
export const aceptarSolicitud = (id) => {
  const solicitud = pendientes.find((s) => s.id === id);
  if (!solicitud) return;
  pendientes = pendientes.filter((s) => s.id !== id);
  aprobados = [solicitud, ...aprobados];
  avisar();
};