import { send, EmailJSResponseStatus } from "@emailjs/react-native";

const EMAILJS = {
  serviceId: "service_ecypchi",
  templateId: "template_q8x643o",
  publicKey: "hbZJOaPQk7nVd99m2",
};

// Variables de la plantilla: {{to_email}}, {{to_name}}, {{evento_titulo}}, {{evento_fecha}}, {{evento_lugar}}
// Devuelve { ok: true } o { ok: false, mensaje } (nunca lanza error).
export const enviarCorreoConfirmacion = async ({ sesion, evento }) => {
  if (!sesion?.email) {
    return { ok: false, mensaje: "El usuario no tiene un correo registrado." };
  }

  const nombreCompleto =
    [sesion.nombre, sesion.apellido].filter(Boolean).join(" ") || "asistente";

  try {
    await send(
      EMAILJS.serviceId,
      EMAILJS.templateId,
      {
        to_email: sesion.email,
        to_name: nombreCompleto,
        evento_titulo: evento.titulo,
        evento_fecha: evento.hora ? `${evento.fecha} · ${evento.hora}` : evento.fecha,
        evento_lugar: evento.lugar,
      },
      { publicKey: EMAILJS.publicKey },
    );
    return { ok: true };
  } catch (e) {
    const detalle =
      e instanceof EmailJSResponseStatus ? `${e.status}: ${e.text}` : e?.message;
    console.log("Error al enviar correo con EmailJS:", detalle);
    return { ok: false, mensaje: detalle || "No se pudo enviar el correo." };
  }
};