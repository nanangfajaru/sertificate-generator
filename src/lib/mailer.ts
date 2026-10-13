import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/** Email sistem dikirim langsung lewat SMTP milik kita (bukan mailer Supabase). */
export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
}

let transport: Transporter | null = null;

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS langsung, selain itu STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendMail(msg: { to: string; subject: string; html: string; text: string }) {
  if (!mailConfigured()) throw new Error("SMTP_NOT_CONFIGURED");
  await getTransport().sendMail({ from: process.env.SMTP_FROM, ...msg });
}
