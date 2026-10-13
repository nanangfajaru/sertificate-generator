import type { Item, Layout } from "../types";
import { compose, layout, W, H, type Palette } from "./compose";
import { P, basketball, hexPts, panel, polyItem, racket, shuttlecock, soccerBall, sprig, star, wave } from "./art";
import type { Theme } from "./themes-a";

const rect = (x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "rect", x, y, w, h, ...o });
const circle = (cx: number, cy: number, r: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "circle", cx, cy, r, ...o });
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 2, opacity = 1): Item => ({ type: "line", x1, y1, x2, y2, stroke, sw, opacity });

/** Garis lapangan bola: kotak luar, garis tengah, lingkaran tengah, area penalti. */
function pitch(m: number, color: string, opacity: number, sw: number, box: { w: number; h: number; r: number }): Item[] {
  const cy = H / 2;
  const o = { stroke: color, sw, opacity };
  return [
    rect(m, m, W - 2 * m, H - 2 * m, o),
    line(W / 2, m, W / 2, H - m, color, sw, opacity),
    circle(W / 2, cy, box.r, o),
    circle(W / 2, cy, 4, { fill: color, opacity }),
    rect(m, cy - box.h / 2, box.w, box.h, o),
    rect(W - m - box.w, cy - box.h / 2, box.w, box.h, o),
  ];
}

// ───────────────────────────── FUTSAL ─────────────────────────────
const futsalP: Palette = { name: "Futsal", primary: "#1e3a8a", accent: "#ea580c", bg: "#1e40af", ink: "#0f172a", muted: "#475569" };

const sportFutsal = (): Layout => {
  const p = futsalP;
  const cy = H / 2;
  const items: Item[] = [
    polyItem([[0, 0], [W * 0.55, 0], [W * 0.3, H], [0, H]], "#2552c7", 0.7),
    polyItem([[W, 0], [W, H], [W * 0.62, H], [W * 0.85, 0]], "#1b3aa0", 0.6),
    ...pitch(34, "#ffffff", 0.55, 2.6, { w: 120, h: 230, r: 64 }),
    P(`M34 ${cy - 100} A100 100 0 0 1 34 ${cy + 100}`, { stroke: "#ffffff", sw: 2.6, opacity: 0.55 }),
    P(`M${W - 34} ${cy + 100} A100 100 0 0 1 ${W - 34} ${cy - 100}`, { stroke: "#ffffff", sw: 2.6, opacity: 0.55 }),
    rect(20, cy - 52, 14, 104, { fill: p.accent }),
    rect(W - 34, cy - 52, 14, 104, { fill: p.accent }),
    polyItem([[34, 34], [94, 34], [34, 94]], p.accent, 0.9),
    polyItem([[W - 34, H - 34], [W - 94, H - 34], [W - 34, H - 94]], p.accent, 0.9),
    panel(80, 46, W - 160, H - 80, 22, "#ffffff", 0.96),
    ...soccerBall(70, H - 74, 28),
    ...soccerBall(W - 66, 76, 24),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 520, qrPos: [672, 464], sign: { xs: [250, 560], lineW: 170 } }),
  ];
  return layout(items, p.bg);
};

// ───────────────────────────── SEPAK BOLA ─────────────────────────────
const soccerP: Palette = { name: "Sepak Bola", primary: "#166534", accent: "#b45309", bg: "#15803d", ink: "#052e16", muted: "#3f5f49" };

const sportSoccer = (): Layout => {
  const p = soccerP;
  const bands = 14;
  const bw = W / bands;
  const items: Item[] = [];
  for (let i = 0; i < bands; i++) items.push(rect(i * bw, 0, bw + 0.6, H, { fill: i % 2 ? "#166534" : "#16803a" }));
  const cy = H / 2;
  items.push(
    ...pitch(28, "#ffffff", 0.6, 2.4, { w: 150, h: 250, r: 60 }),
    rect(28, cy - 62, 54, 124, { stroke: "#ffffff", sw: 2.4, opacity: 0.6 }),
    rect(W - 28 - 54, cy - 62, 54, 124, { stroke: "#ffffff", sw: 2.4, opacity: 0.6 }),
    panel(104, 42, W - 208, H - 76, 18, "#ffffff", 0.96),
    ...soccerBall(66, H - 70, 30),
    ...soccerBall(W - 62, 70, 26),
    // bendera sudut
    line(34, 34, 34, 84, "#fbbf24", 3),
    polyItem([[34, 34], [66, 46], [34, 58]], "#ef4444"),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 480, qrPos: [664, 462], sign: { xs: [250, 566], lineW: 150 } }),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── BASKET ─────────────────────────────
const basketP: Palette = { name: "Basket", primary: "#9a3412", accent: "#ea580c", bg: "#d6a066", ink: "#3b1d0e", muted: "#6b4a33" };

const sportBasket = (): Layout => {
  const p = basketP;
  const items: Item[] = [];
  const pw = W / 22;
  for (let i = 0; i < 22; i++) items.push(rect(i * pw, 0, pw + 0.5, H, { fill: i % 3 === 0 ? "#cf9a60" : i % 3 === 1 ? "#d9a96f" : "#d3a066" }));
  for (let i = 1; i < 22; i++) items.push(line(i * pw, 0, i * pw, H, "#b07a44", 0.8, 0.5));
  const cy = H / 2;
  const lc = "#fff7ed";
  const o = { stroke: lc, sw: 3, opacity: 0.85 };
  items.push(
    rect(26, 26, W - 52, H - 52, o),
    line(W / 2, 26, W / 2, H - 26, lc, 3, 0.85),
    circle(W / 2, cy, 62, o),
    // area cat (key)
    rect(26, cy - 92, 190, 184, { fill: "#c2410c", opacity: 0.55 }),
    rect(26, cy - 92, 190, 184, o),
    rect(W - 26 - 190, cy - 92, 190, 184, { fill: "#c2410c", opacity: 0.55 }),
    rect(W - 26 - 190, cy - 92, 190, 184, o),
    circle(216, cy, 62, o),
    circle(W - 216, cy, 62, o),
    P(`M26 ${cy - 210} L120 ${cy - 210} A216 216 0 0 1 120 ${cy + 210} L26 ${cy + 210}`, o),
    P(`M${W - 26} ${cy - 210} L${W - 120} ${cy - 210} A216 216 0 0 0 ${W - 120} ${cy + 210} L${W - 26} ${cy + 210}`, o),
    panel(104, 42, W - 208, H - 76, 20, "#fffaf0", 0.96),
    ...basketball(64, H - 70, 34),
    ...basketball(W - 62, 72, 30),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 470, qrPos: [664, 462], sign: { xs: [250, 566], lineW: 150 } }),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── BULU TANGKIS ─────────────────────────────
const badP: Palette = { name: "Bulu Tangkis", primary: "#0f766e", accent: "#f97316", bg: "#f0fdfa", ink: "#10302c", muted: "#4b6e69" };

const sportBadminton = (): Layout => {
  const p = badP;
  const lc = "#5eead4";
  const items: Item[] = [
    circle(0, H, 220, { fill: "#ccfbf1", opacity: 0.7 }),
    circle(W, 0, 200, { fill: "#ccfbf1", opacity: 0.7 }),
    rect(34, 34, W - 68, H - 68, { stroke: lc, sw: 2.4, opacity: 0.9 }),
    rect(34, 70, W - 68, H - 140, { stroke: lc, sw: 1.6, opacity: 0.8 }),
    ...racket(60, H - 84, 36, -38, p.primary),
    ...racket(108, H - 62, 33, 30, p.accent),
    ...shuttlecock(W - 76, 96, 36, 28),
    ...shuttlecock(W - 130, 52, 24, -12),
    ...shuttlecock(70, 92, 28, -32),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "script", maxW: 520, qrPos: [722, 468] }),
  ];
  return layout(items, p.bg);
};

// ───────────────────────────── RENANG ─────────────────────────────
const swimP: Palette = { name: "Renang", primary: "#0369a1", accent: "#ef4444", bg: "#ecfeff", ink: "#0c2d44", muted: "#4d7186" };

const sportSwim = (): Layout => {
  const p = swimP;
  const items: Item[] = [];
  [20, 42, 64].forEach((y, k) => {
    items.push(line(0, y, W, y, "#7dd3fc", 1.6, 0.9));
    for (let x = 6 + (k % 2) * 11; x < W; x += 22) items.push(circle(x, y, 6, { fill: [p.primary, "#ffffff", p.accent][Math.floor(x / 22) % 3], stroke: "#7dd3fc", sw: 0.8 }));
  });
  items.push(
    wave(0, W, 548, 4, 260, H, "#a5e3fb", 0.75),
    wave(0, W, 558, 4, 200, H, "#38bdf8", 0.85, 50),
    wave(0, W, 570, 4, 160, H, "#0284c7", 1, 90),
    circle(44, 150, 9, { stroke: "#7dd3fc", sw: 2 }),
    circle(70, 196, 5, { stroke: "#7dd3fc", sw: 2 }),
    circle(30, 232, 3.5, { stroke: "#7dd3fc", sw: 2 }),
    circle(W - 48, 170, 10, { stroke: "#7dd3fc", sw: 2 }),
    circle(W - 78, 214, 6, { stroke: "#7dd3fc", sw: 2 }),
    circle(W - 34, 250, 4, { stroke: "#7dd3fc", sw: 2 }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "script", maxW: 560, qrPos: [722, 456] }).map((i): Item =>
      i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 585, color: "#ffffff" } : i),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── E-SPORT ─────────────────────────────
const espP: Palette = { name: "E-Sport", primary: "#22d3ee", accent: "#a855f7", bg: "#0b0720", ink: "#f8fafc", muted: "#a5b4fc" };

const sportEsport = (): Layout => {
  const p = espP;
  const items: Item[] = [
    polyItem([[0, 0], [250, 0], [170, 96], [0, 160]], "#6d28d9", 0.9),
    polyItem([[0, 0], [130, 0], [0, 86]], "#22d3ee", 0.95),
    polyItem([[W, H], [W - 250, H], [W - 170, H - 96], [W, H - 160]], "#6d28d9", 0.9),
    polyItem([[W, H], [W - 130, H], [W, H - 86]], "#22d3ee", 0.95),
    polyItem([[W - 60, 0], [W, 0], [W, 60]], "#a855f7", 0.6),
    polyItem([[0, H], [60, H], [0, H - 60]], "#a855f7", 0.6),
    P(`M70 20 L${W - 20} 20 L${W - 20} ${H - 70} L${W - 70} ${H - 20} L20 ${H - 20} L20 70 Z`, { stroke: "#22d3ee", sw: 1.6, opacity: 0.8 }),
    P(`M82 30 L${W - 30} 30 L${W - 30} ${H - 82} L${W - 82} ${H - 30} L30 ${H - 30} L30 82 Z`, { stroke: "#a855f7", sw: 0.8, opacity: 0.7 }),
  ];
  // kisi heksagon
  const hx = [[742, 130], [783, 130], [762, 166], [803, 166], [721, 166], [742, 202], [783, 202]];
  hx.forEach(([x, y], i) => items.push(polyItem(hexPts(x, y, 24, 0), i % 3 === 0 ? "#a855f7" : "#22d3ee", i % 3 === 0 ? 0.35 : 0.14)));
  [[70, 400], [111, 400], [90, 436], [131, 436], [49, 436]].forEach(([x, y], i) => items.push(polyItem(hexPts(x, y, 22, 0), i % 2 ? "#22d3ee" : "#a855f7", 0.2)));
  items.push(
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 560, qrPos: [722, 468] }),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── JUARA / MEDALI ─────────────────────────────
const medalP: Palette = { name: "Juara", primary: "#f5c542", accent: "#f5c542", bg: "#0b1d3a", ink: "#f8fafc", muted: "#9fb3d1" };

function medalBadge(cx: number, cy: number, r: number, ribbon: [string, string]): Item[] {
  return [
    polyItem([[cx - r * 0.8, cy - r * 1.9], [cx - r * 0.1, cy - r * 1.9], [cx + r * 0.2, cy], [cx - r * 0.5, cy]], ribbon[0]),
    polyItem([[cx + r * 0.8, cy - r * 1.9], [cx + r * 0.1, cy - r * 1.9], [cx - r * 0.2, cy], [cx + r * 0.5, cy]], ribbon[1]),
    circle(cx, cy, r, { fill: "#f5c542", stroke: "#b8860b", sw: 2.5 }),
    circle(cx, cy, r * 0.76, { stroke: "#b8860b", sw: 1.4 }),
    star(cx, cy, r * 0.55, "#b8860b"),
  ];
}

const sportMedal = (): Layout => {
  const p = medalP;
  const golds = ["#b8860b", "#d4a017", "#f5c542", "#fbd96a"];
  const items: Item[] = [
    circle(W / 2, H / 2, 380, { fill: "#112a52", opacity: 0.8 }),
    circle(W / 2, H / 2, 290, { fill: "#16336a", opacity: 0.55 }),
    rect(20, 20, W - 40, H - 40, { stroke: p.primary, sw: 1.6, opacity: 0.8 }),
    rect(28, 28, W - 56, H - 56, { stroke: p.primary, sw: 0.6, opacity: 0.6 }),
    ...sprig(44, H - 120, 300, 2, golds),
    ...sprig(W - 44, 128, 300, 182, golds),
    ...medalBadge(96, 96, 28, ["#ef4444", "#2563eb"]),
    ...medalBadge(W - 96, 96, 28, ["#2563eb", "#ef4444"]),
    ...[0, 1, 2, 3, 4].map((i) => star(W / 2 - 100 + i * 50, 56, i === 2 ? 15 : 11, p.primary)),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 480, qrPos: [722, 468] }),
  ];
  void wave;
  return layout(items, p.bg);
};

export const THEMES_B: Theme[] = [
  { id: "sport-futsal", name: "Futsal", build: sportFutsal },
  { id: "sport-soccer", name: "Sepak Bola", build: sportSoccer },
  { id: "sport-basket", name: "Basket", build: sportBasket },
  { id: "sport-badminton", name: "Bulu Tangkis", build: sportBadminton },
  { id: "sport-swim", name: "Renang", build: sportSwim },
  { id: "sport-esport", name: "E-Sport", build: sportEsport },
  { id: "sport-medal", name: "Juara", build: sportMedal },
];
