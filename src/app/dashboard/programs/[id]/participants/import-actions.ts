"use server";

import { revalidatePath } from "next/cache";
import { cleanParticipantData } from "@/lib/participant-data";
import { DEFAULT_ROLE, normRole } from "@/lib/cert-types";
import { ROLE_COLUMN } from "./role-column";
import { approveParticipants } from "@/lib/approve";
import { requireUser } from "@/lib/auth";
import { FREE_PARTICIPANT_LIMIT, type Program, type ProgramField } from "@/lib/db";
import { randomCode } from "@/lib/util";

export type ImportResult = {
  error?: string;
  imported?: number;
  approved?: boolean;
  skippedDuplicates?: number;
  skippedLimit?: number;
  /** tidak diterbitkan karena Pro pemilik sudah berakhir (tetap tersimpan sebagai menunggu) */
  blockedPro?: number;
  invalid?: { row: number; reason: string }[];
};

const MAX_ROWS = 2000;

/**
 * Impor peserta dari baris yang sudah dipetakan ke field form (key = field id).
 * `rows[i].line` = nomor baris di file asli, untuk pesan kesalahan.
 */
export async function importParticipants(programId: string, input: { line: number; data: Record<string, string> }[], approve: boolean): Promise<ImportResult> {
  const { supabase, isPro } = await requireUser();
  if (!Array.isArray(input) || input.length === 0) return { error: "Tidak ada data untuk diimpor" };
  if (input.length > MAX_ROWS) return { error: `Maksimal ${MAX_ROWS} peserta sekali impor` };

  // RLS memastikan program milik pengguna ini.
  const [{ data: prog }, { data: f }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", programId).maybeSingle(),
    supabase.from("program_fields").select("*").eq("program_id", programId).order("sort"),
  ]);
  if (!prog) return { error: "Program tidak ditemukan" };
  const program = prog as Program;
  const fields = (f ?? []) as ProgramField[];
  const nameId = program.mapping?.name;
  const emailField = fields.find((x) => x.type === "email");

  const invalid: ImportResult["invalid"] = [];
  const valid: { line: number; data: Record<string, string>; role: string }[] = [];
  for (const r of input) {
    const res = cleanParticipantData(fields, nameId, r.data ?? {});
    // Kolom opsional "Peran" (ROLE_COLUMN): kosong = Peserta.
    if ("error" in res) invalid.push({ row: r.line, reason: res.error });
    else valid.push({ line: r.line, data: res.data, role: normRole(r.data?.[ROLE_COLUMN]) });
  }

  // Lewati email yang sudah terdaftar di program ini atau muncul dua kali di file.
  let skippedDuplicates = 0;
  let rows = valid;
  if (emailField) {
    const { data: existing } = await supabase.from("participants").select("data").eq("program_id", programId).limit(20000);
    const seen = new Set((existing ?? []).map((p) => String((p.data as Record<string, string>)[emailField.id] ?? "").toLowerCase()).filter(Boolean));
    rows = valid.filter((r) => {
      const e = (r.data[emailField.id] ?? "").toLowerCase();
      if (!e) return true;
      if (seen.has(e)) { skippedDuplicates++; return false; }
      seen.add(e);
      return true;
    });
  }

  // Paket Free: batasi sisa kuota (hanya peran Peserta yang dihitung; pembicara dkk. tidak).
  let skippedLimit = 0;
  if (!isPro) {
    const { count } = await supabase.from("participants").select("id", { count: "exact", head: true }).eq("program_id", programId).eq("role", DEFAULT_ROLE);
    let remaining = Math.max(0, FREE_PARTICIPANT_LIMIT - (count ?? 0));
    rows = rows.filter((r) => {
      if (r.role !== DEFAULT_ROLE) return true;
      if (remaining > 0) { remaining--; return true; }
      skippedLimit++;
      return false;
    });
  }

  const ids: string[] = [];
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((r) => ({ program_id: programId, code: randomCode(6), data: r.data, role: r.role }));
    const { data: ins, error } = await supabase.from("participants").insert(chunk).select("id");
    if (error) {
      if (ids.length) revalidatePath(`/dashboard/programs/${programId}`, "layout");
      return { error: error.message.includes("PLAN_LIMIT_PARTICIPANTS") ? "Kuota peserta paket Free sudah penuh." : "Sebagian data gagal disimpan, coba lagi.", imported: ids.length };
    }
    ids.push(...(ins ?? []).map((x) => x.id as string));
  }

  // Disetujui per kelompok kecil agar filter id tidak terlalu panjang.
  let blockedPro = 0;
  if (approve) for (let i = 0; i < ids.length; i += 200) blockedPro += (await approveParticipants(program, ids.slice(i, i + 200))).blocked;
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { imported: ids.length, approved: approve, skippedDuplicates, skippedLimit, blockedPro, invalid: invalid.slice(0, 50) };
}
