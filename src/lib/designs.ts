import type { Layout } from "./certificate/types";

export type DesignDTO = {
  id: string;
  name: string;
  kind: "pdf" | "png" | "jpg";
  layout: Layout;
  previewUrl: string | null;
  updatedAt: string;
};

export const DESIGN_LIMITS = { free: 3, pro: 20 } as const;

/** Layout awal untuk desain baru: nama peserta, kegiatan, tanggal, nomor, dan QR. Satuan desain: lebar 1000. */
export function defaultCustomLayout(height: number, nameFieldId: string | null | undefined): Layout {
  const c = "#1f2937";
  return {
    width: 1000,
    height,
    items: [
      { type: "text", id: "t-name", x: 500, y: Math.round(height * 0.5), size: 64, font: "script", color: c, align: "center", source: nameFieldId ? `field:${nameFieldId}` : "event:event_name", maxWidth: 800 },
      { type: "text", id: "t-event", x: 500, y: Math.round(height * 0.62), size: 28, font: "serif-bold", color: c, align: "center", source: "event:event_name", maxWidth: 800 },
      { type: "text", id: "t-date", x: 500, y: Math.round(height * 0.68), size: 18, font: "sans", color: "#4b5563", align: "center", source: "event:date_location", maxWidth: 800 },
      { type: "text", id: "t-no", x: 500, y: height - 40, size: 14, font: "sans", color: "#4b5563", align: "center", source: "event:cert_number", prefix: "No. " },
      { type: "qr", id: "t-qr", x: 900, y: height - 110, size: 70, color: "#111827" },
    ],
  };
}
