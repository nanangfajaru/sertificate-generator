/** Posisi logo penyelenggara pada template (satuan desain 842×595). Default: tengah atas. */
export type LogoSlot = { cx: number; y: number; w: number; h: number };

export const DEFAULT_LOGO_SLOT: LogoSlot = { cx: 421, y: 26, w: 130, h: 46 };

/** Penyesuaian per template untuk menghindari tabrakan dengan hiasan. */
export const LOGO_SLOTS: Record<string, Partial<LogoSlot>> = {};

export const logoSlotFor = (templateId: string): LogoSlot => ({ ...DEFAULT_LOGO_SLOT, ...(LOGO_SLOTS[templateId] ?? {}) });

/** Template berhias (pita/panel warna): logo diberi alas putih berlekuk agar tetap terbaca. */
export const LOGO_PLATE = new Set([
  "ribbon-slate", "medic-cross", "medic-care", "islami-bintang", "batik-kawung", "kids-ceria",
  "sport-futsal", "sport-soccer", "sport-basket", "sport-badminton", "sport-swim", "sport-esport", "sport-medal",
  "stripe-navy", "stripe-forest", "stripe-violet", "stripe-slate",
]);
