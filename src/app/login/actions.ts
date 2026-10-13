"use server";

import { z } from "zod";
import { confirmEmail, resetEmail } from "@/lib/email-templates";
import { mailConfigured, sendMail } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";

export type AuthResult = { error?: string; info?: string };

const email = z.string().trim().toLowerCase().email("Format email tidak valid.").max(254);
const GENERIC_BUSY = "Terlalu banyak permintaan. Coba lagi beberapa menit lagi.";
const MAIL_DOWN = "Layanan email belum aktif. Hubungi administrator.";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

type Admin = ReturnType<typeof createAdminClient>;

/** Maksimal 3 email per alamat+jenis dalam 15 menit. */
async function allowed(admin: Admin, to: string, kind: string) {
  await admin.from("auth_email_log").delete().lt("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());
  const since = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await admin.from("auth_email_log").select("id", { count: "exact", head: true }).eq("email", to).eq("kind", kind).gte("created_at", since);
  if ((count ?? 0) >= 3) return false;
  await admin.from("auth_email_log").insert({ email: to, kind });
  return true;
}

async function status(admin: Admin, to: string): Promise<"none" | "unconfirmed" | "confirmed"> {
  const { data } = await admin.rpc("auth_user_status", { p_email: to });
  return (data as "none" | "unconfirmed" | "confirmed") ?? "none";
}

function confirmUrl(hashed: string, type: string, next: string) {
  return `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`;
}

export async function registerWithEmail(input: { name: string; email: string; password: string; next?: string }): Promise<AuthResult> {
  const parsed = z
    .object({ name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80), email, password: z.string().min(8, "Password minimal 8 karakter.").max(72) })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!mailConfigured()) return { error: MAIL_DOWN };

  const { name, email: to, password } = parsed.data;
  const next = safeNext(input.next);
  const admin = createAdminClient();
  const st = await status(admin, to);

  if (st === "confirmed") return { error: "Email ini sudah terdaftar. Silakan masuk, atau gunakan Lupa password." };
  if (!(await allowed(admin, to, "confirm"))) return { error: GENERIC_BUSY };

  let hashed: string | undefined;
  let type: string | undefined;
  let userId: string | undefined;
  if (st === "unconfirmed") {
    // Akun sudah dibuat sebelumnya tetapi belum dikonfirmasi: kirim ulang tautan.
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: to });
    if (error) return { error: "Gagal membuat tautan konfirmasi." };
    hashed = data.properties.hashed_token;
    type = data.properties.verification_type;
  } else {
    const { data, error } = await admin.auth.admin.generateLink({ type: "signup", email: to, password, options: { data: { full_name: name } } });
    if (error) return { error: error.message.toLowerCase().includes("password") ? "Password terlalu lemah." : "Pendaftaran gagal. Silakan coba lagi." };
    hashed = data.properties.hashed_token;
    type = data.properties.verification_type;
    userId = data.user.id;
  }

  try {
    const m = confirmEmail(name, to, confirmUrl(hashed!, type!, next));
    await sendMail({ to, ...m });
  } catch (e) {
    console.error("sendMail(confirm) gagal:", e instanceof Error ? e.message : e);
    if (userId) await admin.auth.admin.deleteUser(userId); // jangan tinggalkan akun yatim
    return { error: "Email konfirmasi gagal dikirim. Silakan coba lagi." };
  }
  return { info: "Pendaftaran berhasil. Kami mengirim tautan konfirmasi ke email Anda. Buka tautan itu untuk mengaktifkan akun." };
}

export async function requestPasswordReset(input: { email: string }): Promise<AuthResult> {
  const parsed = email.safeParse(input.email);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!mailConfigured()) return { error: MAIL_DOWN };

  const to = parsed.data;
  const admin = createAdminClient();
  const generic: AuthResult = { info: "Jika email terdaftar, tautan untuk mengatur ulang password sudah dikirim." };

  if ((await status(admin, to)) === "none") return generic; // jangan bocorkan apakah email terdaftar
  if (!(await allowed(admin, to, "reset"))) return { error: GENERIC_BUSY };

  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: to });
  if (error) return generic;
  try {
    await sendMail({ to, ...resetEmail(to, confirmUrl(data.properties.hashed_token, data.properties.verification_type, "/auth/reset")) });
  } catch (e) {
    console.error("sendMail(reset) gagal:", e instanceof Error ? e.message : e);
    return { error: "Email gagal dikirim. Silakan coba lagi." };
  }
  return generic;
}

export async function resendConfirmation(input: { email: string; next?: string }): Promise<AuthResult> {
  const parsed = email.safeParse(input.email);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!mailConfigured()) return { error: MAIL_DOWN };

  const to = parsed.data;
  const admin = createAdminClient();
  const generic: AuthResult = { info: "Jika email belum dikonfirmasi, tautan konfirmasi baru sudah dikirim." };

  if ((await status(admin, to)) !== "unconfirmed") return generic;
  if (!(await allowed(admin, to, "confirm"))) return { error: GENERIC_BUSY };

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: to });
  if (error) return generic;
  try {
    await sendMail({ to, ...confirmEmail(null, to, confirmUrl(data.properties.hashed_token, data.properties.verification_type, safeNext(input.next))) });
  } catch (e) {
    console.error("sendMail(resend) gagal:", e instanceof Error ? e.message : e);
    return { error: "Email gagal dikirim. Silakan coba lagi." };
  }
  return generic;
}
