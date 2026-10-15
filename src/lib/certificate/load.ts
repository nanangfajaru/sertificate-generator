import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant, Program, ProgramField } from "../db";
import { siteUrl } from "../util";
import { resolveLayout, type CertContext } from "./sources";
import { getTemplate } from "./templates";
import { addLogoItem } from "./logo";
import { isProProfile } from "../db";
import { withWatermark } from "./watermark";
import type { ImageItem, Item, Layout } from "./types";
import type { Background, ImageMap } from "./pdf";

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

export async function ownerIsPro(admin: SupabaseClient, ownerId: string): Promise<boolean> {
  const { data } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", ownerId).maybeSingle();
  return isProProfile(data);
}

/** Sertifikat milik paket Free diberi watermark; Pro tanpa watermark. */
export function resolvedFor(program: Program, p: Pick<Participant, "data" | "cert_number" | "code">, watermark = false) {
  const l = resolveLayout(programLayout(program), buildContext(program, p.data, p.cert_number, p.code));
  return watermark ? withWatermark(l) : l;
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

// ───────────────────────── tanda tangan (opsional) ─────────────────────────

const sigPath = (program: Program, n: 1 | 2) => program[`signer${n}_sig_path` as "signer1_sig_path"];

/** Menyisipkan logo penyelenggara dan gambar tanda tangan (tepat di atas teks nama penandatangan). */
export function withBranding(base: Layout, program: Program, opts: { placeholder?: boolean } = {}): Layout {
  // Template: logo dipasang otomatis (opts.placeholder = tampilkan penanda "LOGO" walau belum diunggah).
  const layout = program.cert_mode === "template" && (program.logo_path || opts.placeholder) ? addLogoItem(base, program.template_id) : base;
  const k = layout.width / 842;
  const items: Item[] = [];
  for (const it of layout.items) {
    for (const n of [1, 2] as const) {
      if (it.type === "text" && it.source === `event:signer${n}_name` && sigPath(program, n)) {
        const w = 150 * k;
        const h = 56 * k;
        const cx = it.align === "center" ? it.x : it.align === "left" ? it.x + w / 2 : it.x - w / 2;
        items.push({ type: "image", x: cx - w / 2, y: it.y - it.size - 2 * k - h, w, h, src: `sig${n}`, valign: "bottom" } satisfies ImageItem);
      }
    }
    items.push(it);
  }
  return { ...layout, items };
}

export async function signatureUrls(admin: SupabaseClient, program: Program): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (program.logo_path) {
    const { data } = await admin.storage.from("signatures").createSignedUrl(program.logo_path, 3600);
    if (data?.signedUrl) out.logo = data.signedUrl;
  }
  for (const n of [1, 2] as const) {
    const p = sigPath(program, n);
    if (!p) continue;
    const { data } = await admin.storage.from("signatures").createSignedUrl(p, 3600);
    if (data?.signedUrl) out[`sig${n}`] = data.signedUrl;
  }
  return out;
}

export async function signatureImages(admin: SupabaseClient, program: Program): Promise<ImageMap> {
  const out: ImageMap = {};
  if (program.logo_path) {
    const { data } = await admin.storage.from("signatures").download(program.logo_path);
    if (data) out.logo = { kind: /\.png$/i.test(program.logo_path) ? "png" : "jpg", bytes: new Uint8Array(await data.arrayBuffer()) };
  }
  for (const n of [1, 2] as const) {
    const p = sigPath(program, n);
    if (!p) continue;
    const { data } = await admin.storage.from("signatures").download(p);
    if (data) out[`sig${n}`] = { kind: /\.png$/i.test(p) ? "png" : "jpg", bytes: new Uint8Array(await data.arrayBuffer()) };
  }
  return out;
}
