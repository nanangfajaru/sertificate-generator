import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/** Email sistem dikirim langsung lewat SMTP milik kita (bukan mailer Supabase). */
export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
}

let transport: Transporter | null = null;

function getTransport() {
  if (!transport) {
    const port = Number(String(process.env.SMTP_PORT ?? "587").trim());
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim(),
      port,
      secure: port === 465, // 465 = TLS langsung, selain itu STARTTLS
      auth: { user: process.env.SMTP_USER?.trim(), pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, "") },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transport;
}

export async function sendMail(msg: { to: string; subject: string; html: string; text: string }) {
  if (!mailConfigured()) throw new Error("SMTP_NOT_CONFIGURED");
  await getTransport().sendMail({ from: process.env.SMTP_FROM, ...msg });
}

/** Memeriksa koneksi + login SMTP tanpa mengirim email. */
export async function verifyMail() {
  if (!mailConfigured()) throw new Error("SMTP_NOT_CONFIGURED");
  await getTransport().verify();
}

/** Ringkasan konfigurasi (tanpa password) untuk halaman diagnosis admin. */
export function mailSummary() {
  const user = process.env.SMTP_USER ?? "";
  const [local, domain] = user.split("@");
  return {
    configured: mailConfigured(),
    host: process.env.SMTP_HOST ?? null,
    port: process.env.SMTP_PORT ?? null,
    secure: Number(String(process.env.SMTP_PORT ?? "").trim()) === 465,
    user: domain ? `${local.slice(0, 2)}***@${domain}` : user ? "***" : null,
    from: process.env.SMTP_FROM ?? null,
    hasPass: !!process.env.SMTP_PASS,
  };
}

/** Pesan error ringkas: kode + tanggapan server SMTP (tidak memuat password). */
export function describeMailError(e: unknown): string {
  if (!(e instanceof Error)) return String(e).slice(0, 300);
  const x = e as Error & { code?: string; responseCode?: number; response?: string; command?: string };
  const parts = [x.code, x.responseCode, x.command && `cmd=${x.command}`, (x.response || x.message || "").replace(/\s+/g, " ")].filter(Boolean);
  return parts.join(" · ").slice(0, 300);
}
