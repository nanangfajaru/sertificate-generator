"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Ubah/hapus link pendek (alias) program. Alias kosong = kembali ke link bawaan. */
export async function setAlias(programId: string, raw: string): Promise<{ error?: string; alias?: string | null }> {
  const { supabase } = await requireUser();
  const alias = raw.trim().toLowerCase();
  if (alias && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(alias)) return { error: "Gunakan huruf kecil, angka, dan tanda hubung (-)." };
  if (alias && (alias.length < 3 || alias.length > 40)) return { error: "Panjang link 3–40 karakter." };

  const { data: own } = await supabase.from("programs").select("id").eq("id", programId).maybeSingle();
  if (!own) return { error: "Program tidak ditemukan" };

  if (alias) {
    const admin = createAdminClient();
    const [{ data: a }, { data: s }] = await Promise.all([
      admin.from("programs").select("id").eq("alias", alias).neq("id", programId).maybeSingle(),
      admin.from("programs").select("id").eq("slug", alias).neq("id", programId).maybeSingle(),
    ]);
    if (a || s) return { error: "Link ini sudah dipakai. Coba nama lain." };
  }
  const { error } = await supabase.from("programs").update({ alias: alias || null }).eq("id", programId);
  if (error) return { error: error.code === "23505" ? "Link ini sudah dipakai. Coba nama lain." : "Gagal menyimpan link" };
  revalidatePath(`/dashboard/programs/${programId}`);
  return { alias: alias || null };
}
