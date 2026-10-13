"use server";

import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { confirmEmail } from "@/lib/email-templates";
import { describeMailError, mailConfigured, sendMail, verifyMail } from "@/lib/mailer";

export type TestResult = { ok?: string; error?: string };

/** Khusus admin: uji koneksi SMTP lalu kirim email contoh, dengan pesan error lengkap bila gagal. */
export async function sendTestEmail(to: string): Promise<TestResult> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  const email = z.string().trim().email().safeParse(to);
  if (!email.success) return { error: "Alamat email tidak valid" };
  if (!mailConfigured()) return { error: "Variabel SMTP belum lengkap (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM)." };

  try {
    await verifyMail();
  } catch (e) {
    return { error: `Koneksi/login SMTP gagal: ${describeMailError(e)}` };
  }
  try {
    await sendMail({ to: email.data, ...confirmEmail("Uji Email", email.data, `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/login`) });
  } catch (e) {
    return { error: `Login SMTP berhasil, tetapi pengiriman gagal: ${describeMailError(e)}` };
  }
  return { ok: `Email uji dikirim ke ${email.data}. Periksa inbox dan folder spam.` };
}
