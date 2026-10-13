import type { Item, Layout } from "../types";
import { compose, layout, W, H, type Palette } from "./compose";

export const PALETTES: Record<string, Palette> = {
  navy: { name: "Navy", primary: "#1e3a8a", accent: "#b8860b", bg: "#fffdf7", ink: "#111827", muted: "#6b7280" },
  teal: { name: "Teal", primary: "#0f766e", accent: "#d97706", bg: "#ffffff", ink: "#0f172a", muted: "#64748b" },
  crimson: { name: "Crimson", primary: "#9f1239", accent: "#b8860b", bg: "#fffaf8", ink: "#1f2937", muted: "#6b7280" },
  forest: { name: "Forest", primary: "#166534", accent: "#a16207", bg: "#fbfdf9", ink: "#14231a", muted: "#5b6b60" },
  violet: { name: "Violet", primary: "#5b21b6", accent: "#d97706", bg: "#fdfcff", ink: "#1e1b2e", muted: "#6b6880" },
  slate: { name: "Slate", primary: "#334155", accent: "#0284c7", bg: "#ffffff", ink: "#0f172a", muted: "#64748b" },
  orange: { name: "Orange", primary: "#c2410c", accent: "#0f172a", bg: "#fffdfb", ink: "#1c1917", muted: "#78716c" },
  indigo: { name: "Indigo", primary: "#3730a3", accent: "#d97706", bg: "#fcfcff", ink: "#1e1b4b", muted: "#6b7280" },
  gold: { name: "Gold", primary: "#d4af37", accent: "#d4af37", bg: "#0f172a", ink: "#f8fafc", muted: "#94a3b8" },
  emerald: { name: "Emerald", primary: "#e5c76b", accent: "#e5c76b", bg: "#064e3b", ink: "#ecfdf5", muted: "#a7c4b8" },
};

type Family = (p: Palette) => Layout;

const rect = (x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "rect", x, y, w, h, ...o });

export const FAMILIES: Record<string, Family> = {
  // Bingkai ganda klasik, serif
  classic: (p) =>
    layout(
      [
        rect(24, 24, W - 48, H - 48, { stroke: p.primary, sw: 3 }),
        rect(34, 34, W - 68, H - 68, { stroke: p.accent, sw: 1 }),
        ...[[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].map(([cx, cy]): Item => ({ type: "circle", cx, cy, r: 7, fill: p.accent })),
        ...compose({ palette: p, ax: W / 2, align: "center" }),
      ],
      p.bg,
    ),

  // Balok warna di kiri, rata kiri, modern
  modern: (p) =>
    layout(
      [
        rect(0, 0, 70, H, { fill: p.primary }),
        rect(70, 0, 8, H, { fill: p.accent }),
        rect(120, 70, 60, 5, { fill: p.accent }),
        ...compose({ palette: p, ax: 120, align: "left", titleFont: "sans-bold", nameFont: "serif-bold", bodyFont: "sans", maxW: 600, yShift: -4, qrPos: [736, 468] }),
      ],
      p.bg,
    ),

  // Pita atas & bawah
  ribbon: (p) =>
    layout(
      [
        rect(0, 0, W, 78, { fill: p.primary }),
        rect(0, 78, W, 5, { fill: p.accent }),
        rect(0, H - 30, W, 30, { fill: p.primary }),
        ...compose({ palette: p, ax: W / 2, align: "center", titleColor: p.primary, yShift: 14, maxW: 640 }).map((i): Item =>
          i.type === "qr" ? { ...i, y: 462 } : i),
      ],
      p.bg,
    ),

  // Minimalis: bingkai tipis, banyak ruang
  minimal: (p) =>
    layout(
      [
        rect(30, 30, W - 60, H - 60, { stroke: p.muted, sw: 0.8, opacity: 0.6 }),
        rect(W / 2 - 24, 150, 48, 2.5, { fill: p.accent }),
        ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans", nameFont: "serif", bodyFont: "sans" }),
      ],
      p.bg,
    ),

  // Segitiga di sudut
  geometric: (p) =>
    layout(
      [
        { type: "polygon", points: [[0, 0], [190, 0], [0, 190]], fill: p.primary },
        { type: "polygon", points: [[0, 0], [110, 0], [0, 110]], fill: p.accent },
        { type: "polygon", points: [[W, H], [W - 190, H], [W, H - 190]], fill: p.primary },
        { type: "polygon", points: [[W, H], [W - 110, H], [W, H - 110]], fill: p.accent },
        ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "script", qrPos: [40, 480] }),
      ],
      p.bg,
    ),

  // Latar gelap, emas
  dark: (p) =>
    layout(
      [
        rect(22, 22, W - 44, H - 44, { stroke: p.primary, sw: 2 }),
        rect(30, 30, W - 60, H - 60, { stroke: p.primary, sw: 0.6, opacity: 0.7 }),
        { type: "line", x1: W / 2 - 60, y1: 160, x2: W / 2 + 60, y2: 160, stroke: p.primary, sw: 1 },
        ...compose({ palette: p, ax: W / 2, align: "center", titleColor: p.primary }),
      ],
      p.bg,
    ),

  // Stempel lingkaran di tengah bawah
  seal: (p) =>
    layout(
      [
        rect(0, 0, W, H, { stroke: p.primary, sw: 14 }),
        rect(20, 20, W - 40, H - 40, { stroke: p.accent, sw: 1.5 }),
        { type: "circle", cx: W / 2, cy: 478, r: 40, fill: p.accent, opacity: 0.18 },
        { type: "circle", cx: W / 2, cy: 478, r: 34, stroke: p.accent, sw: 2 },
        { type: "circle", cx: W / 2, cy: 478, r: 26, stroke: p.primary, sw: 1 },
        ...compose({ palette: p, ax: W / 2, align: "center", sign: { xs: [190, 652], lineW: 170 }, qrPos: [760, 520] }).map((i): Item =>
          i.type === "qr" ? { ...i, size: 44 } : i),
      ],
      p.bg,
    ),

  // Siku di empat sudut
  corner: (p) => {
    const arm = 74, t = 5;
    const L = (x: number, y: number, dx: 1 | -1, dy: 1 | -1): Item[] => [
      rect(dx > 0 ? x : x - arm, dy > 0 ? y : y - t, arm, t, { fill: p.primary }),
      rect(dx > 0 ? x : x - t, dy > 0 ? y : y - arm, t, arm, { fill: p.primary }),
      rect(dx > 0 ? x + 14 : x - 14 - 10, dy > 0 ? y + 14 : y - 14 - 10, 10, 10, { fill: p.accent }),
    ];
    return layout(
      [
        ...L(28, 28, 1, 1), ...L(W - 28, 28, -1, 1), ...L(28, H - 28, 1, -1), ...L(W - 28, H - 28, -1, -1),
        rect(52, 52, W - 104, H - 104, { stroke: p.muted, sw: 0.6, opacity: 0.5 }),
        ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script" }),
      ],
      p.bg,
    );
  },

  // Panel warna di sisi kanan
  split: (p) =>
    layout(
      [
        rect(W - 150, 0, 150, H, { fill: p.primary }),
        rect(W - 156, 0, 6, H, { fill: p.accent }),
        { type: "circle", cx: W - 75, cy: 110, r: 42, stroke: p.accent, sw: 2 },
        { type: "circle", cx: W - 75, cy: 110, r: 30, fill: p.accent, opacity: 0.25 },
        { type: "circle", cx: W - 75, cy: 300, r: 6, fill: p.accent },
        ...compose({ palette: p, ax: 346, align: "center", maxW: 520, numX: 346, sign: { xs: [190, 502], lineW: 150 }, qrPos: [W - 103, 470], titleFont: "sans-bold" }),
      ],
      p.bg,
    ),

  // Pita bergaris di atas dan bawah
  stripe: (p) =>
    layout(
      [
        rect(0, 0, W, 14, { fill: p.primary }),
        rect(0, 14, W, 4, { fill: p.accent }),
        rect(0, H - 52, W, 8, { fill: p.accent }),
        rect(0, H - 44, W, 44, { fill: p.primary }),
        ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold" }).map((i): Item =>
          i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 577, color: "#ffffff", size: 10.5 } : i),
      ],
      p.bg,
    ),

  // Bingkai tebal berwarna
  frame: (p) =>
    layout(
      [
        rect(18, 18, W - 36, H - 36, { stroke: p.primary, sw: 36 }),
        rect(46, 46, W - 92, H - 92, { stroke: p.accent, sw: 1.5 }),
        ...[[40, 40], [W - 52, 40], [40, H - 52], [W - 52, H - 52]].map(([x, y]): Item => rect(x, y, 12, 12, { fill: p.accent })),
        ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script" }).map((i): Item =>
          i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 539, size: 9 } : i),
      ],
      p.bg,
    ),
};
