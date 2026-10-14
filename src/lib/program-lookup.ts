import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Program } from "./db";

/** Cari program publik lewat alias (link pendek) lebih dulu, lalu slug asli. */
export async function findProgramByKey(admin: SupabaseClient, key: string): Promise<Program | null> {
  if (!/^[a-z0-9-]{3,60}$/.test(key)) return null;
  const { data: a } = await admin.from("programs").select("*").eq("alias", key).maybeSingle();
  if (a) return a as Program;
  const { data: s } = await admin.from("programs").select("*").eq("slug", key).maybeSingle();
  return (s as Program) ?? null;
}
