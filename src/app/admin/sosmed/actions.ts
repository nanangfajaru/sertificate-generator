"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { SOCIAL_KEYS, SOCIAL_LABEL, normalizeSocial, type Social } from "@/lib/social";
import { createAdminClient } from "@/lib/supabase/admin";

export type SocialState = { error?: string; ok?: boolean; values?: Social };

/** Simpan akun resmi SertifikatKu. Isian boleh @username atau URL; disimpan sebagai URL baku. */
export async function saveSocial(_: SocialState, fd: FormData): Promise<SocialState> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const values = { wa_message: String(fd.get("wa_message") ?? "").trim().slice(0, 200), email } as Social;
  const bad: string[] = [];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push("Email");
  for (const k of SOCIAL_KEYS) {
    const v = normalizeSocial(k, String(fd.get(k) ?? "").slice(0, 200));
    if (v === null) bad.push(SOCIAL_LABEL[k]);
    else values[k] = v;
  }
  if (bad.length) return { error: `Format belum benar: ${bad.join(", ")}` };
  const { error } = await createAdminClient().from("app_settings").upsert({ key: "social", value: values, updated_at: new Date().toISOString() });
  if (error) return { error: "Gagal menyimpan" };
  updateTag("social");
  revalidatePath("/", "layout");
  return { ok: true, values };
}
