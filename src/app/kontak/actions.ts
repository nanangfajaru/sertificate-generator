"use server";

import { z } from "zod";
import { mailConfigured, sendMail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";

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

// Pola spam umum: penawaran SEO/indeks Google/backlink, dsb. (pesan pengguna asli berbahasa Indonesia tentang sertifikat).
const SPAM_PHRASES = /search index|google'?s index|search engine|seo (service|package|expert)|backlink|rank (your|higher)|first page of google|guest post|web ?traffic|crypto|casino|viagra/i;

/** true bila pesan hampir pasti spam; pesan seperti ini diabaikan diam-diam (pengirim tetap melihat "terkirim"). */
function looksLikeSpam(d: { email: string; message: string }, shownAt: number) {
  const elapsed = Date.now() - shownAt;
  // Tanpa JavaScript, dikirim kurang dari 3 detik setelah form tampil, atau stempel waktu tidak masuk akal.
  if (!shownAt || elapsed < 3000 || elapsed > 24 * 3600 * 1000) return true;
  // Domain email meniru nama kita (mis. search-sertifikatku.com).
  const domain = d.email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("sertifikatku") && domain !== "sertifikatku.com") return true;
  return SPAM_PHRASES.test(d.message);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendContact(_: ContactState, fd: FormData): Promise<ContactState> {
  if (String(fd.get("website") ?? "") !== "") return { ok: true }; // honeypot: diam-diam abaikan bot
  const p = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), org: fd.get("org") ?? "", topic: fd.get("topic"), message: fd.get("message") });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Data belum lengkap" };
  const d = p.data;
  if (looksLikeSpam(d, Number(fd.get("t")) || 0)) return { ok: true };
  const admin = createAdminClient();
  // Batas wajar: maks. 3 pesan per email per jam.
  const { count } = await admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("email", d.email).gte("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((count ?? 0) >= 3) return { ok: true };
  // Simpan dulu ke database (terlihat di Admin → Pesan masuk), lalu beri tahu lewat email.
  const { data: row, error: dbErr } = await admin
    .from("contact_messages")
    .insert({ name: d.name, email: d.email, org: d.org || null, topic: d.topic, message: d.message })
    .select("id")
    .single();
  if (dbErr) console.error("simpan kontak gagal:", dbErr.message);

  let emailed = false;
  if (mailConfigured()) {
    const rows: [string, string][] = [["Nama", d.name], ["Email", d.email], ["Instansi", d.org || "—"], ["Topik", d.topic]];
    try {
      await sendMail({
        to: INBOX,
        replyTo: d.email,
        subject: `[Kontak SertifikatKu] ${d.topic} — ${d.name}`,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${d.message}`,
        html: `<table style="font:14px sans-serif">${rows.map(([k, v]) => `<tr><td style="color:#64748b;padding-right:12px">${k}</td><td>${esc(v)}</td></tr>`).join("")}</table><p style="font:14px/1.6 sans-serif;white-space:pre-wrap">${esc(d.message)}</p>`,
      });
      emailed = true;
    } catch (e) {
      console.error("email kontak gagal:", e);
    }
  }
  if (row && emailed) await admin.from("contact_messages").update({ emailed: true }).eq("id", row.id);
  if (!row && !emailed) return { error: `Pesan belum terkirim. Coba lagi, atau email langsung ke ${INBOX}.` };
  return { ok: true };
}
