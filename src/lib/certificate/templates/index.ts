import type { CertTemplate, Layout } from "../types";
import { FAMILIES, PALETTES } from "./families";
import { THEMES_A } from "./themes-a";
import { THEMES_B } from "./themes-b";
import { THEMES_C } from "./themes-c";

const FAMILY_LABEL: Record<string, string> = {
  classic: "Klasik",
  modern: "Modern",
  ribbon: "Pita",
  minimal: "Minimalis",
  geometric: "Geometris",
  dark: "Elegan Gelap",
  seal: "Stempel",
  corner: "Siku",
  split: "Panel",
  stripe: "Garis",
  frame: "Bingkai",
};

function make(family: string, palette: string, tier: "free" | "pro"): CertTemplate {
  return {
    id: `${family}-${palette}`,
    name: `${FAMILY_LABEL[family]} ${PALETTES[palette].name}`,
    tier,
    layout: FAMILIES[family](PALETTES[palette]),
  };
}

// Template yang tersedia untuk semua pengguna (20)
const FREE: [string, string][] = [
  ["classic", "navy"],
  ["modern", "teal"],
  ["ribbon", "slate"],
  ["minimal", "forest"],
  ["geometric", "crimson"],
  ["corner", "navy"], ["corner", "teal"], ["corner", "crimson"], ["corner", "forest"],
  ["split", "indigo"], ["split", "teal"], ["split", "crimson"], ["split", "orange"],
  ["stripe", "navy"], ["stripe", "forest"], ["stripe", "violet"], ["stripe", "slate"],
  ["frame", "crimson"], ["frame", "navy"], ["frame", "forest"],
];

// Template Free lama yang tidak lagi ditampilkan di galeri (galeri Free kini 20), tetap bisa dirender.
const LEGACY_FREE: [string, string][] = [["classic", "teal"], ["modern", "forest"], ["ribbon", "crimson"], ["minimal", "violet"], ["frame", "indigo"]];

// Template Pro lama (bergaris): tidak ditampilkan di galeri, tetap bisa dipakai program yang sudah ada.
const LEGACY_PRO: [string, string][] = [
  ["classic", "crimson"], ["classic", "forest"], ["classic", "violet"],
  ["modern", "navy"], ["modern", "crimson"], ["modern", "violet"],
  ["ribbon", "teal"], ["ribbon", "forest"], ["ribbon", "orange"],
  ["minimal", "navy"], ["minimal", "teal"], ["minimal", "crimson"],
  ["geometric", "orange"], ["geometric", "navy"], ["geometric", "teal"], ["geometric", "violet"],
  ["dark", "gold"], ["dark", "emerald"],
  ["seal", "navy"], ["seal", "crimson"],
];

// Memangkas presisi angka agar layout lebih kecil (kirim ke browser & render lebih cepat).
const r1 = (n: number) => Math.round(n * 10) / 10;
function compact(l: Layout): Layout {
  const walk = (v: unknown, key?: string): unknown => {
    if (typeof v === "number") return Math.round(v * 100) / 100;
    if (typeof v === "string" && key === "d") return v.replace(/-?\d+\.\d+/g, (m) => String(r1(Number(m))));
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return walk(l) as Layout;
}

// Template Pro bertema (ilustrasi): bunga, rumah sakit, olahraga, perusahaan, dll.
const THEMED: CertTemplate[] = [...THEMES_A, ...THEMES_B, ...THEMES_C].map((t) => ({
  id: t.id,
  name: t.name,
  tier: "pro" as const,
  layout: compact(t.build()),
}));

export const TEMPLATES: CertTemplate[] = [...FREE.map(([f, p]) => make(f, p, "free")), ...THEMED];

const LEGACY: CertTemplate[] = [...LEGACY_FREE.map(([f, p]) => make(f, p, "free")), ...LEGACY_PRO.map(([f, p]) => make(f, p, "pro"))];

export const DEFAULT_TEMPLATE_ID = "classic-navy";

export function getTemplate(id: string): CertTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? LEGACY.find((t) => t.id === id) ?? TEMPLATES[0];
}
