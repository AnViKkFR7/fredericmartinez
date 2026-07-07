import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 100;
const MAX_EMAIL_LEN = 254;
const MAX_MSG_LEN = 4000;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const nombre = formData.get("nombre")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const mensaje = formData.get("mensaje")?.toString().trim() ?? "";

  if (
    !nombre ||
    !email ||
    !mensaje ||
    nombre.length > MAX_NAME_LEN ||
    email.length > MAX_EMAIL_LEN ||
    mensaje.length > MAX_MSG_LEN ||
    !EMAIL_REGEX.test(email)
  ) {
    return json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT ?? "587");
  const smtpSecure = process.env.SMTP_SECURE === "true";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("SMTP environment variables not configured");
    return json({ ok: false, error: "send_failed" }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const safeNombre = nombre.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeMensaje = mensaje
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    await transporter.sendMail({
      from: `"${safeNombre}" <${smtpUser}>`,
      replyTo: email,
      to: "hola@fredericmartinez.com",
      subject: `Nuevo mensaje de ${nombre}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
      html: `<p><strong>Nombre:</strong> ${safeNombre}</p><p><strong>Email:</strong> ${email}</p><hr><p>${safeMensaje}</p>`,
    });

    return json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}
