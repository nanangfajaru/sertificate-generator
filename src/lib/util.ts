import { randomBytes } from "node:crypto";

export function randomCode(bytes = 6) {
  return randomBytes(bytes).toString("base64url").replace(/[-_]/g, "x").toLowerCase();
}

export function slugify(s: string) {
  const base = s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "program"}-${randomCode(3)}`;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Format: {no} = urutan 3 digit, {bulan} = bulan romawi, {tahun} = tahun penerbitan */
export function formatCertNumber(format: string, seq: number, now = new Date()) {
  return format
    .replaceAll("{no}", String(seq).padStart(3, "0"))
    .replaceAll("{bulan}", ROMAN[now.getMonth()])
    .replaceAll("{tahun}", String(now.getFullYear()));
}

/** Tautan pendaftaran publik; memakai alias (link pendek) bila ada. */
export function publicLink(p: { slug: string; alias?: string | null }) {
  return `${siteUrl()}/p/${p.alias || p.slug}`;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
