import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Program } from "./db";

/** Cari program publik lewat alias (link pendek) lebih dulu, lalu slug asli. */
export async function findProgramByKey(admin: SupabaseClient, key: string): Promise<Program | null> {
  if (!/^[a-z0-9-]{3,60}$/.test(key)) return null;
  // Satu query untuk alias atau slug; alias diutamakan bila keduanya cocok.
  const { data } = await admin.from("programs").select("*").or(`alias.eq.${key},slug.eq.${key}`).limit(2);
  const rows = (data ?? []) as Program[];
  return rows.find((r) => r.alias === key) ?? rows[0] ?? null;
}
