/**
 * Posisi logo penyelenggara pada template (satuan desain 842×595).
 * side: "L" pojok kiri atas, "R" pojok kanan atas, "C" tengah di atas judul.
 * Dipilih per template sesuai bagian yang kosong; nilai lain opsional (x/y = tepi kiri-atas kotak logo).
 */
export type LogoSlot = { side: "L" | "R" | "C"; x?: number; y: number; w: number; h: number };

export const DEFAULT_LOGO_SLOT: LogoSlot = { side: "R", y: 40, w: 150, h: 62 };

/**
 * Posisi hasil pengukuran: setiap kotak logo (150×62, atau lebih kecil) berjarak minimal 12 unit
 * dari border, hiasan, judul, dan QR pada template (diukur dari render tanpa logo).
 */
export const LOGO_SLOTS: Record<string, Partial<LogoSlot>> = {
  "classic-navy": { side: "R", x: 632, y: 48, w: 150, h: 62 },
  "modern-teal": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "ribbon-slate": { side: "R", x: 632, y: 96, w: 150, h: 62 },
  "minimal-forest": { side: "R", x: 632, y: 42, w: 150, h: 62 },
  "geometric-crimson": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "corner-navy": { side: "R", x: 628, y: 66, w: 150, h: 62 },
  "corner-teal": { side: "R", x: 628, y: 66, w: 150, h: 62 },
  "corner-crimson": { side: "R", x: 628, y: 66, w: 150, h: 62 },
  "corner-forest": { side: "R", x: 628, y: 66, w: 150, h: 62 },
  "split-indigo": { side: "L", x: 44, y: 24, w: 150, h: 62 },
  "split-teal": { side: "L", x: 44, y: 24, w: 150, h: 62 },
  "split-crimson": { side: "L", x: 44, y: 24, w: 150, h: 62 },
  "split-orange": { side: "L", x: 44, y: 24, w: 150, h: 62 },
  "stripe-navy": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "stripe-forest": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "stripe-violet": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "stripe-slate": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "frame-crimson": { side: "R", x: 628, y: 60, w: 150, h: 62 },
  "frame-navy": { side: "R", x: 628, y: 60, w: 150, h: 62 },
  "frame-forest": { side: "R", x: 628, y: 60, w: 150, h: 62 },
  "flora-rose": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "flora-sakura": { side: "L", x: 44, y: 39, w: 150, h: 62 },
  "flora-leaf": { side: "R", x: 580, y: 42, w: 150, h: 62 },
  "flora-sunflower": { side: "L", x: 56, y: 108, w: 150, h: 62 },
  "medic-cross": { side: "R", x: 632, y: 105, w: 150, h: 62 },
  "medic-care": { side: "C", w: 150, h: 45 },
  "sport-futsal": { side: "R", x: 588, y: 60, w: 150, h: 62 },
  "sport-soccer": { side: "R", x: 576, y: 63, w: 150, h: 62 },
  "sport-basket": { side: "R", x: 576, y: 66, w: 150, h: 62 },
  "sport-badminton": { side: "R", x: 596, y: 84, w: 150, h: 62 },
  "sport-swim": { side: "R", x: 632, y: 84, w: 150, h: 62 },
  "sport-esport": { side: "R", x: 582, y: 42, w: 136, h: 56 },
  "sport-medal": { side: "L", x: 56, y: 42, w: 150, h: 62 },
  "company-skyline": { side: "L", x: 56, y: 39, w: 150, h: 62 },
  "company-modern": { side: "C", w: 150, h: 45 },
  "company-tech": { side: "R", x: 632, y: 39, w: 150, h: 62 },
  "edu-graduate": { side: "R", x: 596, y: 39, w: 150, h: 62 },
  "batik-kawung": { side: "R", x: 632, y: 60, w: 150, h: 62 },
  "islami-bintang": { side: "R", x: 632, y: 105, w: 150, h: 62 },
  "kids-ceria": { side: "C", w: 150, h: 45 },
  "eco-hijau": { side: "C", w: 150, h: 45 },
  "art-splash": { side: "C", w: 150, h: 45 },
  "frame-indigo": { side: "R", x: 628, y: 59, w: 150, h: 62 },
};

export const logoSlotFor = (templateId: string): LogoSlot => ({ ...DEFAULT_LOGO_SLOT, ...(LOGO_SLOTS[templateId] ?? {}) });

/** Template berhias (pita/panel warna): logo diberi alas putih berlekuk agar tetap terbaca. */
export const LOGO_PLATE = new Set<string>(["sport-esport", "sport-medal"]);
