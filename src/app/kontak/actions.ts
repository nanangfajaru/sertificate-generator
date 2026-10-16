"use server";

import { z } from "zod";
import { mailConfigured, sendMail } from "@/lib/mailer";

export type ContactState = { ok?: boolean; error?: string };

// Pesan dikirim ke kotak masuk pemilik; alamat ini sudah tercantum publik di halaman Privasi & Syarat.
const INBOX = "nanangfajaru@gmail.com";

const schema = z.object({
  name: z.string().trim().min(2, "Isi nama Anda").max(80),
  email: z.string().trim().email("Format email belum benar").max(120),
  org: z.string().trim().max(120),
  topic: z.enum(["Pertanyaan umum", "Bantuan akun & teknis", "Paket Pro & pembayaran", "Kerja sama / mitra", "Lainnya"]),
  message: z.string().trim().min(10, "Pesan terlalu singkat").max(3000),
});

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendContact(_: ContactState, fd: FormData): Promise<ContactState> {
  if (String(fd.get("website") ?? "") !== "") return { ok: true }; // honeypot: diam-diam abaikan bot
  const p = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), org: fd.get("org") ?? "", topic: fd.get("topic"), message: fd.get("message") });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Data belum lengkap" };
  if (!mailConfigured()) return { error: `Formulir sedang tidak tersedia. Kirim email langsung ke ${INBOX}.` };
  const d = p.data;
  const rows: [string, string][] = [["Nama", d.name], ["Email", d.email], ["Instansi", d.org || "—"], ["Topik", d.topic]];
  try {
    await sendMail({
      to: INBOX,
      replyTo: d.email,
      subject: `[Kontak SertifikatKu] ${d.topic} — ${d.name}`,
      text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${d.message}`,
      html: `<table style="font:14px sans-serif">${rows.map(([k, v]) => `<tr><td style="color:#64748b;padding-right:12px">${k}</td><td>${esc(v)}</td></tr>`).join("")}</table><p style="font:14px/1.6 sans-serif;white-space:pre-wrap">${esc(d.message)}</p>`,
    });
  } catch (e) {
    console.error("kontak gagal:", e);
    return { error: `Pesan belum terkirim. Coba lagi, atau email langsung ke ${INBOX}.` };
  }
  return { ok: true };
}
