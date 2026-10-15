/** Kelompok template untuk filter di halaman pilih sertifikat. */
export const TEMPLATE_GROUPS = [
  { key: "formal", label: "Formal & klasik", match: ["classic-", "ribbon-", "minimal-", "frame-", "corner-"] },
  { key: "modern", label: "Modern", match: ["modern-", "geometric-", "split-", "stripe-"] },
  { key: "nature", label: "Bunga & alam", match: ["flora-", "eco-"] },
  { key: "sport", label: "Olahraga", match: ["sport-"] },
  { key: "health", label: "Kesehatan", match: ["medic-"] },
  { key: "business", label: "Bisnis & teknologi", match: ["company-"] },
  { key: "edu", label: "Pendidikan & anak", match: ["edu-", "kids-"] },
  { key: "culture", label: "Budaya & seni", match: ["batik-", "islami-", "art-"] },
] as const;

export type TemplateGroupKey = (typeof TEMPLATE_GROUPS)[number]["key"];

export function templateGroup(id: string): TemplateGroupKey {
  return TEMPLATE_GROUPS.find((g) => g.match.some((m) => id.startsWith(m)))?.key ?? "modern";
}
