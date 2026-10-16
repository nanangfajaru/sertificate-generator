"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setUserPlan(userId: string, plan: string, expiresAt: string | null): Promise<{ error?: string }> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  const parsed = z
    .object({ userId: z.string().uuid(), plan: z.enum(["free", "pro"]), expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable() })
    .safeParse({ userId, plan, expiresAt });
  if (!parsed.success) return { error: "Data tidak valid" };

  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      plan: parsed.data.plan,
      plan_expires_at: parsed.data.plan === "pro" && parsed.data.expiresAt ? `${parsed.data.expiresAt}T23:59:59+07:00` : null,
    })
    .eq("id", parsed.data.userId);
  if (error) return { error: "Gagal menyimpan" };
  revalidatePath("/admin/users");
  return {};
}

/** Admin: hapus program beserta peserta & field-nya (desain sendiri tetap di pustaka pemiliknya). */
export async function adminDeleteProgram(programId: string): Promise<{ error?: string }> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  if (!z.string().uuid().safeParse(programId).success) return { error: "Data tidak valid" };
  // File logo/tanda tangan tidak dihapus: bisa dipakai bersama oleh program lain milik pengguna yang sama.
  const { error } = await createAdminClient().from("programs").delete().eq("id", programId);
  if (error) return { error: "Gagal menghapus program" };
  revalidatePath("/admin/programs");
  return {};
}

/** Admin: hapus satu peserta secara permanen. */
export async function adminDeleteParticipant(programId: string, participantId: string): Promise<{ error?: string }> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  if (!z.string().uuid().safeParse(programId).success || !z.string().uuid().safeParse(participantId).success) return { error: "Data tidak valid" };
  const { error } = await createAdminClient().from("participants").delete().eq("id", participantId).eq("program_id", programId);
  if (error) return { error: "Gagal menghapus peserta" };
  revalidatePath(`/admin/programs/${programId}`);
  return {};
}
