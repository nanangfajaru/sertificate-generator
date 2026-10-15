/**
 * Posisi logo penyelenggara pada template (satuan desain 842×595).
 * side: "L" pojok kiri atas, "R" pojok kanan atas, "C" tengah di atas judul.
 * Dipilih per template sesuai bagian yang kosong; nilai lain opsional (x/y = tepi kiri-atas kotak logo).
 */
export type LogoSlot = { side: "L" | "R" | "C"; x?: number; y: number; w: number; h: number };

export const DEFAULT_LOGO_SLOT: LogoSlot = { side: "R", y: 40, w: 168, h: 70 };

/**
 * Posisi hasil pengukuran: setiap kotak logo (168×70, atau lebih kecil) berjarak minimal 12 unit
 * dari border, hiasan, judul, dan QR pada template (diukur dari render tanpa logo).
 */
export const LOGO_SLOTS: Record<string, Partial<LogoSlot>> = {
  "classic-navy": { side: "R", x: 614, y: 48, w: 168, h: 70 },
  "modern-teal": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "ribbon-slate": { side: "R", x: 614, y: 96, w: 168, h: 70 },
  "minimal-forest": { side: "R", x: 614, y: 42, w: 168, h: 70 },
  "geometric-crimson": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "corner-navy": { side: "R", x: 610, y: 66, w: 168, h: 70 },
  "corner-teal": { side: "R", x: 610, y: 66, w: 168, h: 70 },
  "corner-crimson": { side: "R", x: 610, y: 66, w: 168, h: 70 },
  "corner-forest": { side: "R", x: 610, y: 66, w: 168, h: 70 },
  "split-indigo": { side: "L", x: 48, y: 39, w: 144, h: 60 },
  "split-teal": { side: "L", x: 48, y: 39, w: 144, h: 60 },
  "split-crimson": { side: "L", x: 48, y: 39, w: 144, h: 60 },
  "split-orange": { side: "L", x: 48, y: 39, w: 144, h: 60 },
  "stripe-navy": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "stripe-forest": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "stripe-violet": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "stripe-slate": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "frame-crimson": { side: "R", x: 610, y: 60, w: 168, h: 70 },
  "frame-navy": { side: "R", x: 610, y: 60, w: 168, h: 70 },
  "frame-forest": { side: "R", x: 610, y: 60, w: 168, h: 70 },
  "flora-rose": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "flora-sakura": { side: "L", x: 56, y: 24, w: 160, h: 66 },
  "flora-leaf": { side: "L", x: 56, y: 51, w: 168, h: 70 },
  "flora-sunflower": { side: "L", x: 56, y: 39, w: 168, h: 70 },
  "medic-cross": { side: "R", x: 614, y: 66, w: 168, h: 70 },
  "medic-care": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "sport-futsal": { side: "L", x: 96, y: 66, w: 168, h: 70 },
  "sport-soccer": { side: "L", x: 116, y: 69, w: 152, h: 63 },
  "sport-basket": { side: "L", x: 116, y: 69, w: 152, h: 63 },
  "sport-badminton": { side: "R", x: 578, y: 84, w: 168, h: 70 },
  "sport-swim": { side: "R", x: 614, y: 48, w: 168, h: 70 },
  "sport-esport": { side: "L", x: 52, y: 44, w: 150, h: 62 },
  "sport-medal": { side: "L", x: 56, y: 42, w: 168, h: 70 },
  "company-skyline": { side: "L", x: 56, y: 39, w: 168, h: 70 },
  "company-modern": { side: "C", w: 168, h: 52 },
  "company-tech": { side: "R", x: 614, y: 39, w: 168, h: 70 },
  "edu-graduate": { side: "R", x: 578, y: 39, w: 168, h: 70 },
  "batik-kawung": { side: "R", x: 614, y: 60, w: 168, h: 70 },
  "islami-bintang": { side: "R", x: 614, y: 78, w: 168, h: 70 },
  "kids-ceria": { side: "C", w: 168, h: 52 },
  "eco-hijau": { side: "C", w: 168, h: 52 },
  "art-splash": { side: "R", x: 614, y: 24, w: 168, h: 56 },
  "frame-indigo": { side: "R", x: 610, y: 60, w: 168, h: 70 },
};

export const logoSlotFor = (templateId: string): LogoSlot => ({ ...DEFAULT_LOGO_SLOT, ...(LOGO_SLOTS[templateId] ?? {}) });

/** Template berhias (pita/panel warna): logo diberi alas putih berlekuk agar tetap terbaca. */
export const LOGO_PLATE = new Set<string>(["sport-esport", "sport-medal"]);
