import type { CertTemplate } from "../types";
import { FAMILIES, PALETTES } from "./families";

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

// Template yang tersedia untuk semua pengguna (25)
const FREE: [string, string][] = [
  ["classic", "navy"],
  ["modern", "teal"],
  ["ribbon", "slate"],
  ["minimal", "forest"],
  ["geometric", "crimson"],
  ["corner", "navy"], ["corner", "teal"], ["corner", "crimson"], ["corner", "forest"],
  ["split", "indigo"], ["split", "teal"], ["split", "crimson"], ["split", "orange"],
  ["stripe", "navy"], ["stripe", "forest"], ["stripe", "violet"], ["stripe", "slate"],
  ["frame", "crimson"], ["frame", "navy"], ["frame", "forest"], ["frame", "indigo"],
  ["classic", "teal"], ["modern", "forest"], ["ribbon", "crimson"], ["minimal", "violet"],
];

// Template khusus paket berbayar (20). Tambah baris di sini untuk menambah template baru.
const PRO: [string, string][] = [
  ["classic", "crimson"], ["classic", "forest"], ["classic", "violet"],
  ["modern", "navy"], ["modern", "crimson"], ["modern", "violet"],
  ["ribbon", "teal"], ["ribbon", "forest"], ["ribbon", "orange"],
  ["minimal", "navy"], ["minimal", "teal"], ["minimal", "crimson"],
  ["geometric", "orange"], ["geometric", "navy"], ["geometric", "teal"], ["geometric", "violet"],
  ["dark", "gold"], ["dark", "emerald"],
  ["seal", "navy"], ["seal", "crimson"],
];

export const TEMPLATES: CertTemplate[] = [
  ...FREE.map(([f, p]) => make(f, p, "free")),
  ...PRO.map(([f, p]) => make(f, p, "pro")),
];

export const DEFAULT_TEMPLATE_ID = "classic-navy";

export function getTemplate(id: string): CertTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
