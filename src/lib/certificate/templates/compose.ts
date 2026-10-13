import type { Item, Layout, TextItem } from "../types";

export const W = 842;
export const H = 595;

export type Palette = {
  name: string;
  primary: string;
  accent: string;
  bg: string;
  ink: string;
  muted: string;
};

type Opts = {
  palette: Palette;
  align: "center" | "left";
  /** x jangkar teks utama */
  ax: number;
  titleFont?: TextItem["font"];
  nameFont?: TextItem["font"];
  bodyFont?: TextItem["font"];
  titleColor?: string;
  maxW?: number;
  yShift?: number;
  qrPos?: [number, number];
  /** x tengah nomor sertifikat (default: tengah halaman) */
  numX?: number;
  sign?: { xs: [number, number]; lineW: number };
};

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 140;
};

const t = (p: Partial<TextItem> & Pick<TextItem, "x" | "y" | "size" | "font" | "color" | "align">): TextItem => ({ type: "text", ...p });

/** Susunan teks standar sertifikat; keluarga template hanya berbeda di dekorasi + parameter ini. */
export function compose(o: Opts): Item[] {
  const { palette: p, align, ax } = o;
  const s = o.yShift ?? 0;
  const bodyFont = o.bodyFont ?? "sans";
  const maxW = o.maxW ?? 620;
  const sign = o.sign ?? (align === "center" ? { xs: [250, 592] as [number, number], lineW: 170 } : { xs: [ax + 85, ax + 335] as [number, number], lineW: 170 });
  const items: Item[] = [
    t({ x: ax, y: 118 + s, size: 40, font: o.titleFont ?? "serif-bold", color: o.titleColor ?? p.primary, align, text: "SERTIFIKAT", spacing: 6 }),
    t({ x: ax, y: 148 + s, size: 13, font: "sans-bold", color: p.accent, align, source: "event:cert_type", upper: true, spacing: 5 }),
    t({ x: ax, y: 198 + s, size: 13, font: bodyFont, color: p.muted, align, text: "diberikan kepada" }),
    t({ x: ax, y: 262 + s, size: 56, font: o.nameFont ?? "script", color: p.ink, align, source: "slot:name", maxWidth: maxW }),
    t({ x: ax, y: 300 + s, size: 14, font: bodyFont, color: p.muted, align, source: "slot:extra", maxWidth: maxW }),
    t({ x: ax, y: 336 + s, size: 13, font: bodyFont, color: p.ink, align, source: "event:description", maxWidth: maxW }),
    t({ x: ax, y: 368 + s, size: 22, font: "serif-bold", color: p.primary, align, source: "event:event_name", maxWidth: maxW }),
    t({ x: ax, y: 392 + s, size: 12, font: bodyFont, color: p.muted, align, source: "event:org_name", maxWidth: maxW }),
    t({ x: ax, y: 412 + s, size: 12, font: bodyFont, color: p.muted, align, source: "event:date_location", maxWidth: maxW }),
  ];
  // penandatangan
  ([1, 2] as const).forEach((n, i) => {
    const cx = sign.xs[i];
    const left = align === "left";
    const x = left ? cx - sign.lineW / 2 : cx;
    const a = left ? "left" : "center";
    const lx1 = cx - sign.lineW / 2;
    items.push(
      { type: "line", x1: lx1, y1: 494, x2: lx1 + sign.lineW, y2: 494, stroke: p.muted, sw: 0.8, showIf: `event:signer${n}_name` },
      t({ x, y: 510, size: 13, font: "sans-bold", color: p.ink, align: a, source: `event:signer${n}_name`, maxWidth: sign.lineW + 40 }),
      t({ x, y: 525, size: 10.5, font: bodyFont, color: p.muted, align: a, source: `event:signer${n}_title`, maxWidth: sign.lineW + 40 }),
    );
  });
  items.push(
    t({ x: o.numX ?? (align === "center" ? W / 2 : ax), y: 556, size: 9.5, font: bodyFont, color: p.muted, align: align === "center" ? "center" : "left", source: "event:cert_number", prefix: "No. " }),
    { type: "qr", x: o.qrPos?.[0] ?? 728, y: o.qrPos?.[1] ?? 470, size: 56, color: isLight(p.ink) ? p.bg : p.ink },
  );
  return items;
}

export function layout(items: Item[], bg: string): Layout {
  return { width: W, height: H, bg, items };
}
