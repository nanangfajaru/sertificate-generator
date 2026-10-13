import type { Item, Layout } from "../types";
import { compose, layout, W, H, type Palette } from "./compose";
import {
  P, capsule, ellipseD, heartD, leaf, panel, plusPts, polyItem, ring, rose, sakura, sprig, sunflower, tp, wave,
} from "./art";

export type Theme = { id: string; name: string; build: () => Layout };

const rect = (x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "rect", x, y, w, h, ...o });
const circle = (cx: number, cy: number, r: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "circle", cx, cy, r, ...o });

/** Salin elemen dengan rotasi 180° terhadap pusat halaman: sudut kiri-atas jadi kanan-bawah. */
function pointMirror(build: (sgn: 1 | -1) => Item[]): Item[] {
  return [...build(1), ...build(-1)];
}

// ───────────────────────────── BUNGA ─────────────────────────────
const roseP: Palette = { name: "Mawar", primary: "#9d174d", accent: "#b8860b", bg: "#fff8f6", ink: "#3b1d2a", muted: "#7c5a66" };

function roseCluster(sgn: 1 | -1): Item[] {
  const X = (x: number) => (sgn === 1 ? x : W - x);
  const Y = (y: number) => (sgn === 1 ? y : H - y);
  const r = sgn === 1 ? 0 : 180;
  const greens = ["#3f6212", "#4d7c0f", "#65a30d", "#84cc16"];
  return [
    ...sprig(X(14), Y(190), 150, r + 8, greens),
    ...sprig(X(190), Y(14), 70, r + 98, greens, { flip: true }),
    ...sprig(X(40), Y(40), 150, r + 136, greens),
    ...rose(X(60), Y(62), 50, ["#fbcfe8", "#f472b6", "#be185d", "#831843"]),
    ...rose(X(138), Y(36), 31, ["#fecdd3", "#fb7185", "#be123c", "#881337"]),
    ...rose(X(36), Y(140), 30, ["#fecdd3", "#fb7185", "#be123c", "#881337"]),
    ...rose(X(112), Y(112), 20, ["#fde2e8", "#f9a8d4", "#db2777", "#9d174d"]),
    circle(X(190), Y(60), 4, { fill: "#f9a8d4" }),
    circle(X(60), Y(188), 4, { fill: "#f9a8d4" }),
  ];
}

const floraRose = (): Layout =>
  layout(
    [
      rect(18, 18, W - 36, H - 36, { stroke: roseP.accent, sw: 1.2, opacity: 0.8 }),
      rect(26, 26, W - 52, H - 52, { stroke: roseP.accent, sw: 0.5, opacity: 0.6 }),
      ...pointMirror(roseCluster),
      ...compose({ palette: roseP, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 560, qrPos: [46, 488] }),
    ],
    roseP.bg,
  );

const sakuraP: Palette = { name: "Sakura", primary: "#be185d", accent: "#92400e", bg: "#fff5f7", ink: "#4a2330", muted: "#8a6572" };

const floraSakura = (): Layout => {
  const p = sakuraP;
  const items: Item[] = [
    wave(0, W, 540, 4, 220, H, "#fde4ea", 0.7),
    // ranting utama dari kanan-atas
    P("M860 30 C 790 60 750 22 690 50 C 650 70 620 40 575 52", { stroke: "#7c4a2d", sw: 7, cap: "round" }),
    P("M700 44 C 692 72 700 96 690 118", { stroke: "#7c4a2d", sw: 4, cap: "round" }),
    P("M742 48 C 744 70 740 84 740 96", { stroke: "#7c4a2d", sw: 3, cap: "round" }),
  ];
  const blossoms: [number, number, number, number][] = [
    [780, 44, 24, 10], [712, 34, 20, -20], [650, 58, 24, 25], [598, 46, 17, 5], [690, 118, 18, 12], [740, 96, 14, -15],
  ];
  blossoms.forEach(([x, y, r, a]) => items.push(...sakura(x, y, r, a)));
  // sudut kiri-bawah
  items.push(P("M-10 470 C 40 500 60 540 120 565", { stroke: "#7c4a2d", sw: 6, cap: "round" }));
  ([[38, 492, 22, 5], [78, 528, 19, -18], [120, 560, 16, 22], [20, 438, 15, 30]] as const).forEach(([x, y, r, a]) => items.push(...sakura(x, y, r, a)));
  // kelopak berguguran
  const fall: [number, number, number][] = [[210, 120, 20], [140, 230, 60], [780, 220, 110], [800, 320, 30], [760, 400, 160], [230, 455, 80], [330, 525, 200], [790, 470, 90], [80, 330, 130], [95, 150, 45]];
  fall.forEach(([x, y, a], i) => items.push(P(`M${x} ${y} C ${x - 6} ${y - 8} ${x - 3} ${y - 16} ${x} ${y - 17} C ${x + 3} ${y - 16} ${x + 6} ${y - 8} ${x} ${y} Z`, { fill: i % 2 ? "#fbcfe8" : "#f9a8d4", opacity: 0.85 })));
  void tp;
  items.push(...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 560, qrPos: [722, 468] }));
  return layout(items, p.bg);
};

const leafP: Palette = { name: "Botani", primary: "#166534", accent: "#a16207", bg: "#fbfdf8", ink: "#14231a", muted: "#5b6b60" };

const floraLeaf = (): Layout => {
  const p = leafP;
  const g = ["#14532d", "#166534", "#15803d", "#4d7c0f", "#65a30d"];
  const items: Item[] = [
    rect(30, 30, W - 60, H - 60, { stroke: p.accent, sw: 0.8, opacity: 0.55 }),
    // karangan kiri dan kanan
    ...sprig(34, H - 70, 250, 2, g, { berries: "#dc2626" }),
    ...sprig(62, H - 48, 170, 14, g.slice().reverse(), { flip: true }),
    ...sprig(W - 34, 70, 250, 182, g, { berries: "#dc2626" }),
    ...sprig(W - 62, 48, 170, 194, g.slice().reverse(), { flip: true }),
    // sudut
    ...sprig(28, 30, 120, 125, g),
    ...sprig(W - 28, H - 30, 120, 305, g),
    ...sprig(150, 22, 90, 95, g.slice().reverse(), { flip: true }),
    ...sprig(W - 150, H - 22, 90, 275, g.slice().reverse(), { flip: true }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 520, qrPos: [722, 468] }),
  ];
  return layout(items, p.bg);
};

const sunP: Palette = { name: "Matahari", primary: "#92400e", accent: "#d97706", bg: "#fffbeb", ink: "#422006", muted: "#7c5a2e" };

const floraSun = (): Layout => {
  const p = sunP;
  const g = ["#365314", "#4d7c0f", "#65a30d"];
  const items: Item[] = [
    rect(0, 0, W, 14, { fill: "#fbbf24" }),
    rect(0, 14, W, 4, { fill: p.primary }),
    ...sprig(120, H - 6, 120, 22, g),
    ...sprig(14, H - 130, 120, 4, g, { flip: true }),
    ...sprig(W - 150, 12, 120, 190, g),
    ...sunflower(34, H - 34, 70),
    ...sunflower(W - 62, 74, 58),
    ...sunflower(150, 66, 30),
    ...sunflower(W - 40, H - 44, 36),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 500, qrPos: [708, 468] }),
  ];
  return layout(items, p.bg);
};

// ───────────────────────────── MEDIS ─────────────────────────────
const medP: Palette = { name: "Rumah Sakit", primary: "#0f766e", accent: "#dc2626", bg: "#f7fffd", ink: "#0f2f2c", muted: "#4b6b67" };

const medicCross = (): Layout => {
  const p = medP;
  const items: Item[] = [
    rect(0, 0, W, 88, { fill: p.primary }),
    rect(0, 88, W, 5, { fill: "#5eead4" }),
    // pola plus pada pita
    ...Array.from({ length: 16 }, (_, i) => polyItem(plusPts(150 + i * 44, i % 2 ? 26 : 62, 9, 3.4), "#ffffff", 0.16)),
    // lencana salib medis
    circle(80, 46, 34, { fill: "#ffffff" }),
    circle(80, 46, 34, { stroke: "#5eead4", sw: 3 }),
    polyItem(plusPts(80, 46, 21, 14), p.accent),
    // plus raksasa pudar di belakang teks
    polyItem(plusPts(W / 2, 318, 170, 74), "#d9f5f0", 0.55),
    // denyut jantung
    P("M0 574 L200 574 L214 574 L226 552 L240 592 L254 540 L268 586 L280 574 L842 574", { stroke: "#0ea5e9", sw: 2.5, opacity: 0.55, cap: "round" }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "script", maxW: 560, yShift: 14, qrPos: [726, 478] }),
  ];
  return layout(items, p.bg);
};

const careP: Palette = { name: "Kesehatan", primary: "#0369a1", accent: "#e11d48", bg: "#f2f9ff", ink: "#0c2a40", muted: "#4d6b82" };

const medicCare = (): Layout => {
  const p = careP;
  const items: Item[] = [
    circle(0, 0, 210, { fill: "#dbeafe", opacity: 0.7 }),
    circle(0, 0, 150, { fill: "#bfdbfe", opacity: 0.6 }),
    circle(W, H, 210, { fill: "#dbeafe", opacity: 0.7 }),
    circle(W, H, 150, { fill: "#bfdbfe", opacity: 0.6 }),
    P(heartD(86, 82, 44), { fill: p.accent }),
    P(heartD(86, 82, 44), { stroke: "#ffffff", sw: 3, opacity: 0.0 }),
    P("M20 100 L60 100 L72 82 L88 124 L102 70 L116 108 L126 100 L190 100", { stroke: "#ffffff", sw: 3, cap: "round", opacity: 0.95 }),
    ...capsule(W - 100, 70, 74, 26, 35, "#38bdf8", "#ffffff"),
    ...capsule(W - 52, 118, 56, 20, -25, "#fb7185", "#ffffff"),
    ...capsule(70, H - 90, 70, 24, -30, "#fbbf24", "#ffffff"),
    ...capsule(124, H - 48, 54, 20, 20, "#34d399", "#ffffff"),
    // stetoskop sederhana
    P("M640 40 C 640 90 690 90 690 40", { stroke: "#64748b", sw: 3.5, cap: "round", opacity: 0.0 }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "script", maxW: 560, qrPos: [726, 470] }),
  ];
  void ring; void leaf; void ellipseD; void panel;
  return layout(items, p.bg);
};

export const THEMES_A: Theme[] = [
  { id: "flora-rose", name: "Bunga Mawar", build: floraRose },
  { id: "flora-sakura", name: "Bunga Sakura", build: floraSakura },
  { id: "flora-leaf", name: "Daun Botani", build: floraLeaf },
  { id: "flora-sunflower", name: "Bunga Matahari", build: floraSun },
  { id: "medic-cross", name: "Rumah Sakit", build: medicCross },
  { id: "medic-care", name: "Kesehatan", build: medicCare },
];
