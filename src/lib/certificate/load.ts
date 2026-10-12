import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant, Program, ProgramField } from "../db";
import { siteUrl } from "../util";
import { resolveLayout, type CertContext } from "./sources";
import { getTemplate } from "./templates";
import type { Layout } from "./types";
import type { Background } from "./pdf";

export function programLayout(program: Program): Layout {
  const base = program.cert_mode === "custom" && program.design_layout ? program.design_layout : getTemplate(program.template_id).layout;
  return program.show_qr ? base : { ...base, items: base.items.filter((i) => i.type !== "qr") };
}

export function buildContext(program: Program, data: Record<string, string>, certNumber: string | null, code: string): CertContext {
  return { program, data, certNumber, verifyUrl: `${siteUrl()}/c/${code}` };
}

export function sampleContext(program: Program, fields: ProgramField[]): CertContext {
  const data: Record<string, string> = {};
  for (const f of fields) data[f.id] = f.id === program.mapping?.name ? "Nama Peserta Contoh" : f.label;
  return buildContext(program, data, "001/SERT/I/2026", "contoh");
}

export function resolvedFor(program: Program, p: Pick<Participant, "data" | "cert_number" | "code">) {
  return resolveLayout(programLayout(program), buildContext(program, p.data, p.cert_number, p.code));
}

export async function loadBackground(admin: SupabaseClient, program: Program): Promise<Background> {
  if (program.cert_mode !== "custom" || !program.design_path || !program.design_kind) return null;
  const { data, error } = await admin.storage.from("designs").download(program.design_path);
  if (error || !data) throw new Error("Gagal membaca file desain");
  return { kind: program.design_kind, bytes: new Uint8Array(await data.arrayBuffer()) } as Background;
}

export async function previewUrl(admin: SupabaseClient, program: Program): Promise<string | null> {
  if (program.cert_mode !== "custom" || !program.design_preview_path) return null;
  const { data } = await admin.storage.from("designs").createSignedUrl(program.design_preview_path, 3600);
  return data?.signedUrl ?? null;
}
