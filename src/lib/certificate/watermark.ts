import type { Item, Layout, TextItem } from "./types";

export const WATERMARK_TEXT = "sertifikatku.com";

/** Teks kecil "sertifikatku.com" di bawah QR untuk sertifikat milik paket Free. */
export function withWatermark(layout: Layout): Layout {
  const qr = layout.items.find((i): i is Extract<Item, { type: "qr" }> => i.type === "qr");
  const size = Math.round(layout.width * 0.008);
  const mark: TextItem = qr
    ? { type: "text", x: qr.x + qr.size / 2, y: qr.y + qr.size + size + 3, size, font: "sans", color: qr.color, align: "center", text: WATERMARK_TEXT, opacity: 0.8 }
    : { type: "text", x: layout.width - 24, y: layout.height - 14, size, font: "sans", color: "#64748b", align: "right", text: WATERMARK_TEXT, opacity: 0.8 };
  return { ...layout, items: [...layout.items, mark] };
}
