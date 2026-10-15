"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReferralState = { error?: string; ok?: boolean };

export async function savePayoutInfo(_: ReferralState, fd: FormData): Promise<ReferralState> {
  const { profile } = await requireUser();
  const info = String(fd.get("payout") ?? "").trim().slice(0, 300);
  await createAdminClient().from("vouchers").update({ payout_info: info || null }).eq("owner_id", profile.id);
  revalidatePath("/dashboard/referral");
  return { ok: true };
}
