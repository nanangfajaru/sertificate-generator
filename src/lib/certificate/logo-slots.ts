/**
 * Posisi logo penyelenggara pada template (satuan desain 842×595).
 * side: "L" pojok kiri atas, "R" pojok kanan atas, "C" tengah di atas judul.
 * Dipilih per template sesuai bagian yang kosong; nilai lain opsional (x/y = tepi kiri-atas kotak logo).
 */
export type LogoSlot = { side: "L" | "R" | "C"; x?: number; y: number; w: number; h: number };

export const DEFAULT_LOGO_SLOT: LogoSlot = { side: "R", y: 40, w: 120, h: 52 };

/**
 * Posisi hasil pengukuran: setiap kotak logo (120×52, atau lebih kecil) berjarak minimal 12 unit
 * dari border, hiasan, judul, dan QR pada template (diukur dari render tanpa logo).
 */
export const LOGO_SLOTS: Record<string, Partial<LogoSlot>> = {
  "classic-navy": { x: 664, y: 50 },
  "modern-teal": { x: 664, y: 38 },
  "ribbon-slate": { x: 664, y: 11, h: 40 }, // di dalam pita (beralas putih)
  "minimal-forest": { x: 664, y: 46 },
  "geometric-crimson": { x: 664, y: 38 },
  "corner-navy": { x: 652, y: 66 }, "corner-teal": { x: 652, y: 66 }, "corner-crimson": { x: 652, y: 66 }, "corner-forest": { x: 652, y: 66 },
  "split-indigo": { side: "L", x: 58, y: 38 }, "split-teal": { side: "L", x: 58, y: 38 }, "split-crimson": { side: "L", x: 58, y: 38 }, "split-orange": { side: "L", x: 58, y: 38 },
  "stripe-navy": { x: 664, y: 38 }, "stripe-forest": { x: 664, y: 38 }, "stripe-violet": { x: 664, y: 38 }, "stripe-slate": { x: 664, y: 38 },
  "frame-crimson": { x: 658, y: 62 }, "frame-navy": { x: 658, y: 62 }, "frame-forest": { x: 658, y: 62 }, "frame-indigo": { x: 658, y: 62 },
  "flora-rose": { x: 664, y: 42 }, "flora-sakura": { side: "L", x: 58, y: 38 }, "flora-leaf": { x: 610, y: 46 }, "flora-sunflower": { side: "C", h: 34 },
  "medic-cross": { x: 664, y: 14, h: 46 }, "medic-care": { side: "C", h: 46 },
  "sport-futsal": { side: "L", x: 96, y: 68, w: 110, h: 44 }, "sport-soccer": { side: "L", x: 120, y: 60, w: 110, h: 44 },
  "sport-basket": { side: "L", x: 120, y: 64, w: 110, h: 44 }, "sport-badminton": { side: "L", x: 90, y: 84, w: 110, h: 44 },
  "sport-swim": { x: 664, y: 86 }, "sport-esport": { x: 666, y: 44, w: 110, h: 44 }, "sport-medal": { side: "L", x: 138, y: 40, w: 110, h: 44 },
  "company-skyline": { side: "L", x: 58, y: 38 }, "company-modern": { side: "C", h: 46 }, "company-tech": { x: 658, y: 38 },
  "edu-graduate": { x: 628, y: 42 }, "batik-kawung": { x: 658, y: 62 }, "islami-bintang": { x: 664, y: 12, h: 46 },
  "kids-ceria": { side: "C", h: 46 }, "eco-hijau": { side: "C", h: 46 }, "art-splash": { x: 664, y: 26 },
};

export const logoSlotFor = (templateId: string): LogoSlot => ({ ...DEFAULT_LOGO_SLOT, ...(LOGO_SLOTS[templateId] ?? {}) });

/** Template berhias (pita/panel warna): logo diberi alas putih berlekuk agar tetap terbaca. */
export const LOGO_PLATE = new Set<string>([
  "ribbon-slate", "medic-cross", "islami-bintang", "sport-esport", "sport-medal",
]);
