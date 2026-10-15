import { addLogoItem } from "./logo";
import type { ImageItem, Item, Layout } from "./types";

export type BrandOpts = {
  certMode: "template" | "custom";
  templateId: string;
  /** pasang logo (gambar asli atau penanda LOGO) pada template */
  logo: boolean;
  sig1: boolean;
  sig2: boolean;
};

/**
 * Menyisipkan logo penyelenggara (template) dan gambar tanda tangan (tepat di atas nama penandatangan).
 * Murni, sehingga dipakai di server (PDF) maupun browser (pratinjau).
 */
export function brandLayout(base: Layout, o: BrandOpts): Layout {
  const layout = o.certMode === "template" && o.logo ? addLogoItem(base, o.templateId) : base;
  const k = layout.width / 842;
  const items: Item[] = [];
  for (const it of layout.items) {
    for (const n of [1, 2] as const) {
      if (it.type === "text" && it.source === `event:signer${n}_name` && (n === 1 ? o.sig1 : o.sig2)) {
        // Kotak tanda tangan sebesar ruang kosong antara baris tanggal dan garis penandatangan.
        const dateY = layout.items.find((x) => x.type === "text" && x.source === "event:date_location");
        const bottom = it.y - it.size - 2 * k;
        const top = dateY && dateY.type === "text" ? dateY.y + 9 * k : bottom - 70 * k;
        const w = 210 * k;
        const h = Math.min(76 * k, Math.max(40 * k, bottom - top));
        const cx = it.align === "center" ? it.x : it.align === "left" ? it.x + w / 2 : it.x - w / 2;
        items.push({ type: "image", x: cx - w / 2, y: bottom - h, w, h, src: `sig${n}`, valign: "bottom" } satisfies ImageItem);
      }
    }
    items.push(it);
  }
  return { ...layout, items };
}
