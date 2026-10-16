import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant, Program, ProgramField } from "../db";
import { siteUrl } from "../util";
import { resolveLayout, type CertContext } from "./sources";
import { getTemplate } from "./templates";
import { brandLayout } from "./branding";
import { isProProfile } from "../db";
import { withWatermark } from "./watermark";
import { withRole } from "../cert-types";
import type { ImageItem, Item, Layout } from "./types";
import type { Background, ImageMap } from "./pdf";

export function programLayout(program: Program): Layout {
  const base = program.cert_mode === "custom" && program.design_layout ? program.design_layout : getTemplate(program.template_id).layout;
  return program.show_qr ? base : { ...base, items: base.items.filter((i) => i.type !== "qr") };
}

export function buildContext(program: Program, data: Record<string, string>, certNumber: string | null, code: string, role?: string | null): CertContext {
  return { program: withRole(program, role), data, certNumber, verifyUrl: `${siteUrl()}/c/${code}` };
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
export function resolvedFor(program: Program, p: Pick<Participant, "data" | "cert_number" | "code"> & { role?: string | null }, watermark = false) {
  const l = resolveLayout(programLayout(program), buildContext(program, p.data, p.cert_number, p.code, p.role));
  return watermark ? withWatermark(l) : l;
}

export async function loadBackground(admin: SupabaseClient, program: Program): Promise<Background> {
  if (program.cert_mode !== "custom" || !program.design_path || !program.design_kind) return null;
  const bytes = await cachedDownload(admin, "designs", program.design_path);
  if (!bytes) throw new Error("Gagal membaca file desain");
  return { kind: program.design_kind, bytes } as Background;
}

export async function previewUrl(admin: SupabaseClient, program: Program): Promise<string | null> {
  if (program.cert_mode !== "custom" || !program.design_preview_path) return null;
  const { data } = await admin.storage.from("designs").createSignedUrl(program.design_preview_path, 3600);
  return data?.signedUrl ?? null;
}

// ───────────────────────── tanda tangan (opsional) ─────────────────────────

const sigPath = (program: Program, n: 1 | 2) => program[`signer${n}_sig_path` as "signer1_sig_path"];

/** Menyisipkan logo penyelenggara dan gambar tanda tangan (opts.placeholder = tampilkan penanda "LOGO" walau belum diunggah). */
export function withBranding(base: Layout, program: Program, opts: { placeholder?: boolean } = {}): Layout {
  return brandLayout(base, {
    certMode: program.cert_mode,
    templateId: program.template_id,
    logo: !!program.logo_path || !!opts.placeholder,
    sig1: !!sigPath(program, 1),
    sig2: !!sigPath(program, 2),
  });
}

export async function signatureUrls(admin: SupabaseClient, program: Program): Promise<Record<string, string>> {
  const keys = (["logo", "sig1", "sig2"] as const).map((k) => [k, k === "logo" ? program.logo_path : sigPath(program, k === "sig1" ? 1 : 2)] as const).filter(([, p]) => !!p) as [string, string][];
  if (!keys.length) return {};
  // Satu permintaan untuk semua URL bertanda tangan.
  const { data } = await admin.storage.from("signatures").createSignedUrls(keys.map(([, p]) => p), 3600);
  const byPath = new Map((data ?? []).map((x) => [x.path, x.signedUrl]));
  const out: Record<string, string> = {};
  for (const [k, p] of keys) {
    const u = byPath.get(p);
    if (u) out[k] = u;
  }
  return out;
}

// File di storage tidak pernah ditimpa (nama selalu baru saat diunggah ulang), jadi aman disimpan
// di memori instance server. Dibatasi agar tidak membengkak.
const fileCache = new Map<string, Uint8Array>();
let cacheBytes = 0;
const CACHE_MAX = 40 * 1024 * 1024;
const ENTRY_MAX = 6 * 1024 * 1024;

async function cachedDownload(admin: SupabaseClient, bucket: string, path: string): Promise<Uint8Array | null> {
  const key = `${bucket}/${path}`;
  const hit = fileCache.get(key);
  if (hit) {
    fileCache.delete(key);
    fileCache.set(key, hit); // tandai baru dipakai (LRU)
    return hit;
  }
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  const bytes = new Uint8Array(await data.arrayBuffer());
  if (bytes.byteLength <= ENTRY_MAX) {
    fileCache.set(key, bytes);
    cacheBytes += bytes.byteLength;
    for (const [k, v] of fileCache) {
      if (cacheBytes <= CACHE_MAX) break;
      fileCache.delete(k);
      cacheBytes -= v.byteLength;
    }
  }
  return bytes;
}

export async function signatureImages(admin: SupabaseClient, program: Program): Promise<ImageMap> {
  const keys = (["logo", "sig1", "sig2"] as const).map((k) => [k, k === "logo" ? program.logo_path : sigPath(program, k === "sig1" ? 1 : 2)] as const).filter(([, p]) => !!p) as [string, string][];
  const files = await Promise.all(keys.map(([, p]) => cachedDownload(admin, "signatures", p)));
  const out: ImageMap = {};
  keys.forEach(([k, p], i) => {
    const bytes = files[i];
    if (bytes) out[k] = { kind: /\.png$/i.test(p) ? "png" : "jpg", bytes };
  });
  return out;
}
