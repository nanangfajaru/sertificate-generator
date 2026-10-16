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

const DEFAULT_NAME = "SertifikatKu";

/**
 * Nama pengirim selalu nama merek ("SertifikatKu", atau SMTP_FROM_NAME bila diisi), sehingga inbox
 * menampilkan merek, bukan bagian depan alamat Gmail. Hanya alamat dari SMTP_FROM yang dipakai.
 */
export function parseFrom(raw: string | undefined): { name: string; address: string } {
  const value = (raw ?? "").trim();
  const m = value.match(/^"?([^"<]*?)"?\s*<([^>]+)>$/);
  const address = (m ? m[2] : value).trim();
  const name = process.env.SMTP_FROM_NAME?.trim() || DEFAULT_NAME; // nama merek tetap, abaikan nama lama di SMTP_FROM
  return { name, address };
}

export async function sendMail(msg: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  if (!mailConfigured()) throw new Error("SMTP_NOT_CONFIGURED");
  await getTransport().sendMail({
    from: parseFrom(process.env.SMTP_FROM),
    ...msg,
    // Penanda surel transaksional otomatis (mengurangi balasan otomatis, membantu klasifikasi).
    headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" },
  });
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
    from: process.env.SMTP_FROM ? (({ name, address }) => `${name} <${address}>`)(parseFrom(process.env.SMTP_FROM)) : null,
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
