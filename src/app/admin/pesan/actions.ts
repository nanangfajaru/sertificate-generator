"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setMessageStatus(id: string, status: "baru" | "dibalas" | "selesai") {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return;
  if (!["baru", "dibalas", "selesai"].includes(status)) return;
  await createAdminClient().from("contact_messages").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string) {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return;
  await createAdminClient().from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}
