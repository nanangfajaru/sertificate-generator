import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant, Program, ProgramField } from "../db";
import { siteUrl } from "../util";
import { resolveLayout, type CertContext } from "./sources";
import { getTemplate } from "./templates";
import { LOGO_PLATE, logoSlotFor } from "./logo-slots";
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

/** Logo penyelenggara pada template (desain sendiri memakai elemen logo di editor). */
function withLogo(layout: Layout, program: Program): Layout {
  if (!program.logo_path || program.cert_mode !== "template") return layout;
  const k = layout.width / 842;
  const slot = logoSlotFor(program.template_id);
  const w = slot.w * k;
  let x: number, y: number, h = slot.h * k;
  if (slot.side === "C") {
    // Tengah: mengikuti judul "SERTIFIKAT" dan berada tepat di atasnya.
    const title = layout.items.find((i): i is Extract<Item, { type: "text" }> => i.type === "text" && i.text === "SERTIFIKAT");
    let cx = layout.width / 2;
    let bottom = (slot.y + slot.h) * k;
    if (title) {
      const tw = Math.min(title.size * 6.2, 330 * k);
      cx = title.align === "center" ? title.x : title.align === "left" ? title.x + tw / 2 : title.x - tw / 2;
      bottom = title.y - title.size * 0.8 - 17 * k;
    }
    h = Math.min(h, Math.max(24 * k, bottom - 14 * k));
    x = cx - w / 2;
    y = bottom - h;
  } else {
    x = slot.x != null ? slot.x * k : slot.side === "L" ? 60 * k : layout.width - 60 * k - w;
    y = slot.y * k;
  }
  const img: ImageItem = { type: "image", x, y, w, h, src: "logo" };
  const add: Item[] = [img];
  if (LOGO_PLATE.has(program.template_id)) {
    const pad = 6 * k, r = 8 * k;
    const x = img.x - pad, y = img.y - pad, pw = img.w + pad * 2, ph = img.h + pad * 2;
    const d = `M${x + r} ${y}h${pw - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${ph - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${pw - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${ph - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
    add.unshift({ type: "path", d, fill: "#ffffff", opacity: 0.96 });
  }
  // Disisipkan sebelum item teks/QR pertama agar berada di atas hiasan latar.
  const at = layout.items.findIndex((i) => i.type === "text" || i.type === "qr");
  const items = layout.items.slice();
  items.splice(at < 0 ? items.length : at, 0, ...add);
  return { ...layout, items };
}

/** Menyisipkan logo penyelenggara dan gambar tanda tangan (tepat di atas teks nama penandatangan). */
export function withBranding(base: Layout, program: Program): Layout {
  const layout = withLogo(base, program);
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
