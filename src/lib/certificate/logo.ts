import { LOGO_PLATE, logoSlotFor } from "./logo-slots";
import type { ImageItem, Item, Layout } from "./types";

/**
 * Menyisipkan logo penyelenggara (dan alas putih bila perlu) pada layout template.
 * Murni (tanpa akses server) sehingga bisa dipakai juga di pratinjau browser.
 */
export function addLogoItem(layout: Layout, templateId: string): Layout {
  const k = layout.width / 842;
  const slot = logoSlotFor(templateId);
  const w = slot.w * k;
  let x: number, y: number, h = slot.h * k;
  if (slot.side === "C") {
    // Tengah: mengikuti judul "SERTIFIKAT" dan berada tepat di atasnya.
    const title = layout.items.find((i): i is Extract<Item, { type: "text" }> => i.type === "text" && i.text === "SERTIFIKAT");
    let cx = layout.width / 2;
    let bottom = (slot.y + slot.h) * k;
    if (title) {
      const tw = Math.min(title.size * 6.2, 330 * k);
      cx = title.align === "center" ? title.x : title.align === "left" ? title.x + tw / 2 : title.x - tw / 2;
      bottom = title.y - title.size * 0.8 - 17 * k;
    }
    h = Math.min(h, Math.max(24 * k, bottom - 14 * k));
    x = cx - w / 2;
    y = bottom - h;
  } else {
    x = slot.x != null ? slot.x * k : slot.side === "L" ? 60 * k : layout.width - 60 * k - w;
    y = slot.y * k;
  }
  const img: ImageItem = { type: "image", x, y, w, h, src: "logo" };
  const add: Item[] = [img];
  if (LOGO_PLATE.has(templateId)) {
    const pad = 6 * k, r = 8 * k;
    const px = x - pad, py = y - pad, pw = w + pad * 2, ph = h + pad * 2;
    const d = `M${px + r} ${py}h${pw - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${ph - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${pw - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${ph - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
    add.unshift({ type: "path", d, fill: "#ffffff", opacity: 0.96 });
  }
  // Disisipkan sebelum item teks/QR pertama agar berada di atas hiasan latar.
  const at = layout.items.findIndex((i) => i.type === "text" || i.type === "qr");
  const items = layout.items.slice();
  items.splice(at < 0 ? items.length : at, 0, ...add);
  return { ...layout, items };
}
