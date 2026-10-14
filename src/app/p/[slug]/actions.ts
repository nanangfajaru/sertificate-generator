"use server";

import { findProgramByKey } from "@/lib/program-lookup";
import { redirect } from "next/navigation";
import { approveParticipants } from "@/lib/approve";
import type { Program, ProgramField } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomCode } from "@/lib/util";

export type RegisterState = { error?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitRegistration(slug: string, _: RegisterState, fd: FormData): Promise<RegisterState> {
  if (String(fd.get("website") ?? "") !== "") return { error: "Permintaan ditolak." }; // honeypot

  const admin = createAdminClient();
  const prog = await findProgramByKey(admin, slug);
  if (!prog) return { error: "Program tidak ditemukan." };
  const program = prog as Program;
  if (!program.is_open) return { error: "Pendaftaran sudah ditutup." };

  const { data: f } = await admin.from("program_fields").select("*").eq("program_id", program.id).order("sort");
  const fields = (f ?? []) as ProgramField[];

  const data: Record<string, string> = {};
  for (const field of fields) {
    const v = String(fd.get(`f_${field.id}`) ?? "").trim();
    if (!v) {
      if (field.required) return { error: `"${field.label}" wajib diisi.` };
      continue;
    }
    if (v.length > (field.type === "textarea" ? 2000 : 300)) return { error: `"${field.label}" terlalu panjang.` };
    if (field.type === "email" && !EMAIL.test(v)) return { error: `Format email pada "${field.label}" tidak valid.` };
    if (field.type === "number" && !Number.isFinite(Number(v))) return { error: `"${field.label}" harus berupa angka.` };
    if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `"${field.label}" harus berupa tanggal.` };
    if (field.type === "select" && !field.options.includes(v)) return { error: `Pilihan pada "${field.label}" tidak valid.` };
    data[field.id] = v;
  }

  // Cegah pendaftaran ganda dengan email yang sama.
  const emailField = fields.find((x) => x.type === "email");
  if (emailField && data[emailField.id]) {
    const { count } = await admin
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("program_id", program.id)
      .ilike(`data->>${emailField.id}`, data[emailField.id].replace(/[%_\\]/g, "\\$&"));
    if (count) return { error: "Email ini sudah terdaftar pada program ini." };
  }

  const code = randomCode(6);
  const { data: row, error } = await admin.from("participants").insert({ program_id: program.id, code, data }).select("id").single();
  if (error?.message.includes("PLAN_LIMIT_PARTICIPANTS")) return { error: "Kuota peserta untuk kegiatan ini sudah penuh. Hubungi penyelenggara." };
  if (error || !row) return { error: "Gagal menyimpan pendaftaran, silakan coba lagi." };

  if (program.approval_mode === "auto") await approveParticipants(program, [row.id]);
  redirect(`/c/${code}`);
}
