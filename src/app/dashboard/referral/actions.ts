"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createReferral } from "@/lib/referral";

export type ReferralState = { error?: string; ok?: boolean };

export async function savePayoutInfo(_: ReferralState, fd: FormData): Promise<ReferralState> {
  const { profile } = await requireUser();
  const info = String(fd.get("payout") ?? "").trim().slice(0, 300);
  await createAdminClient().from("vouchers").update({ payout_info: info || null }).eq("owner_id", profile.id);
  revalidatePath("/dashboard/referral");
  return { ok: true };
}

/** Tombol "Buat kode referral": hanya untuk pengguna Pro (atau admin). */
export async function createMyReferral(): Promise<ReferralState> {
  const { profile, isPro } = await requireUser();
  if (!isPro && !profile.is_admin) return { error: "Kode referral khusus pengguna Pro" };
  const v = await createReferral(createAdminClient(), profile);
  if (!v) return { error: "Gagal membuat kode, coba lagi" };
  revalidatePath("/dashboard/referral");
  return { ok: true };
}
