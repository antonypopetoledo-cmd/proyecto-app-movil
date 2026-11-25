// Lista única de categorías temáticas de LimaGo.
export const INTERESES = [
  { id: "musica", label: "Música y Conciertos", emoji: "🎵" },
  { id: "geek", label: "Anime y Gaming", emoji: "🎮" },
  { id: "arte", label: "Arte y Teatro", emoji: "🎭" },
  { id: "gastronomia", label: "Gastronomía", emoji: "🍔" },
  { id: "tech_negocios", label: "Tech y Emprendimiento", emoji: "💻" },
  { id: "universitarios", label: "Universitarios", emoji: "🎓" },
  { id: "deportes", label: "Deportes", emoji: "⚽" },
];

const NORMALIZAR_CATEGORIA = {
  musica: "Música y Conciertos",
  kpop: "Música y Conciertos",
  "💗 k-pop": "Música y Conciertos",
  conciertos: "Música y Conciertos",
  "🎵 conciertos": "Música y Conciertos",
  festivales: "Música y Conciertos",
  "🎉 festivales": "Música y Conciertos",

  geek: "Anime y Gaming",
  anime: "Anime y Gaming",
  "🍥 anime": "Anime y Gaming",
  gaming: "Anime y Gaming",
  "🎮 gaming": "Anime y Gaming",

  arte: "Arte y Teatro",
  "🎨 arte y cultura": "Arte y Teatro",
  teatro: "Arte y Teatro",
  "🎭 teatro": "Arte y Teatro",

  gastronomia: "Gastronomía",
  "🍔 ferias gastronómicas": "Gastronomía",

  tech_negocios: "Tech y Emprendimiento",
  tecnologia: "Tech y Emprendimiento",
  "💻 tecnología": "Tech y Emprendimiento",
  emprendimiento: "Tech y Emprendimiento",
  "🧑‍💼 emprendimiento": "Tech y Emprendimiento",

  universitarios: "Universitarios",
  "🎓 eventos universitarios": "Universitarios",

  deportes: "Deportes",
  "⚽ deportes": "Deportes",
};

export const obtenerNombreCategoria = (valor = "") => {
  const clave = String(valor)
    .replace(/^[^\p{L}\p{N}]+/u, "") // quita cualquier emoji previo para evitar duplicados
    .trim()
    .toLowerCase();

  const labelLimpio = NORMALIZAR_CATEGORIA[clave] || valor;
  const encontrada = INTERESES.find(
    (c) =>
      c.id.toLowerCase() === clave ||
      c.label.toLowerCase() === labelLimpio.toLowerCase()
  );

  return encontrada ? `${encontrada.emoji} ${encontrada.label}` : labelLimpio || "✨ Otros";
};