import type { Item, Layout, TextItem } from "./types";

const TEXT = "Dibuat dengan Sertifikat Online";

/** Menambahkan watermark diagonal (di belakang teks & QR) untuk sertifikat milik paket Free. */
export function withWatermark(layout: Layout): Layout {
  const { width: w, height: h } = layout;
  const mark = (cx: number, cy: number): TextItem => ({
    type: "text", x: cx, y: cy, size: Math.round(w * 0.03), font: "sans-bold", color: "#64748b",
    align: "center", text: TEXT, opacity: 0.16, rotate: -28,
  });
  const marks = [mark(w * 0.3, h * 0.76), mark(w * 0.5, h * 0.56), mark(w * 0.7, h * 0.36)];
  const at = layout.items.findIndex((i: Item) => i.type === "text" || i.type === "qr");
  const items = layout.items.slice();
  items.splice(at < 0 ? items.length : at, 0, ...marks);
  return { ...layout, items };
}
