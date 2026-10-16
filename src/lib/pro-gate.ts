import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getTemplate } from "./certificate/templates";
import { isProProfile, type Program } from "./db";

export type ProgramForGate = Pick<Program, "owner_id" | "cert_mode" | "template_id">;

/** Program memakai fitur Pro untuk sertifikatnya (template bertanda Pro atau desain sendiri). */
export function usesProFeature(p: Pick<Program, "cert_mode" | "template_id">) {
  return p.cert_mode === "custom" || getTemplate(p.template_id).tier === "pro";
}

/**
 * Bila pemilik tidak lagi Pro tetapi programnya memakai fitur Pro, sertifikat hanya boleh terbit untuk
 * peserta yang mendaftar sebelum paket Pro berakhir (`cutoff`). Pendaftaran tetap diterima.
 */
export async function getProGate(admin: SupabaseClient, program: ProgramForGate): Promise<{ gated: false } | { gated: true; cutoff: string | null }> {
  if (!usesProFeature(program)) return { gated: false };
  const { data } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", program.owner_id).maybeSingle();
  if (isProProfile(data)) return { gated: false };
  return { gated: true, cutoff: (data?.plan_expires_at as string | null) ?? null };
}

/** Peserta boleh diterbitkan bila mendaftar sebelum/pada saat Pro berakhir. */
export function allowedByGate(gate: Awaited<ReturnType<typeof getProGate>>, createdAt: string) {
  if (!gate.gated) return true;
  return !!gate.cutoff && new Date(createdAt) <= new Date(gate.cutoff);
}

export const PRO_ENDED_MESSAGE =
  "Paket Pro sudah berakhir dan program ini memakai template Pro / desain sendiri. Sertifikat peserta yang mendaftar setelah Pro berakhir tidak dapat diterbitkan. Perpanjang Pro atau ganti ke template Free.";
