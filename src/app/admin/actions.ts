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
