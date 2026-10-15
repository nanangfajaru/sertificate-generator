/**
 * Posisi logo penyelenggara pada template (satuan desain 842×595).
 * side: "L" pojok kiri atas, "R" pojok kanan atas, "C" tengah di atas judul.
 * Dipilih per template sesuai bagian yang kosong; nilai lain opsional (x/y = tepi kiri-atas kotak logo).
 */
export type LogoSlot = { side: "L" | "R" | "C"; x?: number; y: number; w: number; h: number };

export const DEFAULT_LOGO_SLOT: LogoSlot = { side: "R", y: 40, w: 120, h: 52 };

export const LOGO_SLOTS: Record<string, Partial<LogoSlot>> = {
  "ribbon-slate": { y: 74 },
  "frame-crimson": { x: 640 }, "frame-navy": { x: 640 }, "frame-forest": { x: 640 }, "frame-indigo": { x: 640 },
  "corner-navy": { x: 620 }, "corner-teal": { x: 620 }, "corner-crimson": { x: 620 }, "corner-forest": { x: 620 },
  "split-indigo": { side: "L" }, "split-teal": { side: "L" }, "split-crimson": { side: "L" }, "split-orange": { side: "L" },
  "flora-rose": { x: 640 }, "flora-sakura": { side: "L" }, "flora-leaf": { x: 600 }, "flora-sunflower": { side: "C" },
  "medic-cross": { y: 16 }, "medic-care": { side: "C" },
  "sport-futsal": { side: "C" }, "sport-soccer": { side: "C" }, "sport-basket": { side: "C" }, "sport-badminton": { side: "C" },
  "sport-swim": { side: "C" }, "sport-medal": { side: "C" },
  "company-skyline": { side: "L" }, "company-modern": { side: "C" }, "company-tech": { x: 650 },
  "edu-graduate": { x: 640 }, "batik-kawung": { x: 640, y: 58 }, "islami-bintang": { y: 12 },
  "kids-ceria": { side: "C" }, "eco-hijau": { side: "C" }, "art-splash": { y: 30 },
};

export const logoSlotFor = (templateId: string): LogoSlot => ({ ...DEFAULT_LOGO_SLOT, ...(LOGO_SLOTS[templateId] ?? {}) });

/** Template berhias (pita/panel warna): logo diberi alas putih berlekuk agar tetap terbaca. */
export const LOGO_PLATE = new Set<string>([
  "medic-cross", "islami-bintang", "batik-kawung",
  "sport-futsal", "sport-soccer", "sport-basket", "sport-badminton", "sport-swim", "sport-esport", "sport-medal",
]);
