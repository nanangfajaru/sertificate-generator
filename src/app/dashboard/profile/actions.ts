"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const opt = (max: number) => z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullable());

const schema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  phone: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/, "Nomor telepon tidak valid").nullable(),
  ),
  organization: opt(120),
  job_title: opt(80),
});

export type ProfileState = { error?: string; ok?: boolean };

export async function updateProfile(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const { profile } = await requireUser();
  const p = schema.safeParse({
    full_name: fd.get("full_name"),
    phone: fd.get("phone"),
    organization: fd.get("organization"),
    job_title: fd.get("job_title"),
  });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Data tidak valid" };
  // Tabel profiles tidak punya policy update untuk pengguna (agar plan/is_admin aman), jadi lewat server.
  const { error } = await createAdminClient().from("profiles").update(p.data).eq("id", profile.id);
  if (error) return { error: "Gagal menyimpan profil" };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
