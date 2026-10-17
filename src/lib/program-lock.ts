import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_PROGRAM_LIMIT, isProProfile } from "./db";

/**
 * Program yang terkunci karena Pro pemilik sudah berakhir dan jumlah programnya melebihi batas Free:
 * FREE_PROGRAM_LIMIT program terlama tetap aktif, sisanya (yang dibuat paling akhir) dikunci.
 * Dihitung saat dibutuhkan, sehingga otomatis terbuka lagi begitu Pro diperpanjang.
 */
export async function lockedProgramIds(admin: SupabaseClient, ownerId: string): Promise<Set<string>> {
  const { data: prof } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", ownerId).maybeSingle();
  if (isProProfile(prof)) return new Set();
  const { data } = await admin.from("programs").select("id").eq("owner_id", ownerId).order("created_at", { ascending: true }).order("id");
  return new Set((data ?? []).slice(FREE_PROGRAM_LIMIT).map((p) => p.id as string));
}

export async function isProgramLocked(admin: SupabaseClient, program: { id: string; owner_id: string }) {
  return (await lockedProgramIds(admin, program.owner_id)).has(program.id);
}

/** Versi tanpa query untuk daftar program yang sudah dimuat (urutan dihitung ulang dari created_at). */
export function lockedFromList(programs: { id: string; created_at: string }[], isPro: boolean): Set<string> {
  if (isPro) return new Set();
  const asc = [...programs].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  return new Set(asc.slice(FREE_PROGRAM_LIMIT).map((p) => p.id));
}
