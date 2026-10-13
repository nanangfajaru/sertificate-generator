import type { Item, Layout } from "../types";
import { compose, layout, W, H, type Palette } from "./compose";
import { P, balloon, blob, book, cloud, dots, earth, gradCap, hexPts, kawung, polyItem, sprig, star, wave, skyline } from "./art";
import type { Theme } from "./themes-a";

const rect = (x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "rect", x, y, w, h, ...o });
const circle = (cx: number, cy: number, r: number, o: { fill?: string; stroke?: string; sw?: number; opacity?: number } = {}): Item => ({ type: "circle", cx, cy, r, ...o });
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 2, opacity = 1): Item => ({ type: "line", x1, y1, x2, y2, stroke, sw, opacity });

// ───────────────────────────── KORPORAT ─────────────────────────────
const corpP: Palette = { name: "Korporat", primary: "#0b2a4a", accent: "#b8902f", bg: "#ffffff", ink: "#0f172a", muted: "#64748b" };

const companySkyline = (): Layout => {
  const p = corpP;
  const items: Item[] = [
    rect(0, 0, W, 10, { fill: p.primary }),
    rect(0, 10, W, 3, { fill: p.accent }),
    ...skyline(0, 132, H, 11, 150, 330, "#9fb2c8", "#ffffff", 0.55),
    ...skyline(W - 132, W, H, 23, 150, 330, "#9fb2c8", "#ffffff", 0.55),
    ...skyline(0, 118, H, 7, 90, 240, p.primary, "#e2c06b"),
    ...skyline(W - 118, W, H, 19, 90, 240, p.primary, "#e2c06b"),
    rect(0, H - 8, W, 8, { fill: p.accent }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "serif-bold", maxW: 520, yShift: 8, qrPos: [766, 26] }),
  ];
  return layout(items, p.bg);
};

const modernP: Palette = { name: "Perusahaan Modern", primary: "#0f766e", accent: "#f59e0b", bg: "#ffffff", ink: "#0f172a", muted: "#64748b" };

const companyModern = (): Layout => {
  const p = modernP;
  const items: Item[] = [
    circle(0, 0, 200, { fill: "#0f766e" }),
    circle(0, 0, 150, { fill: "#14b8a6" }),
    circle(0, 0, 100, { fill: "#99f6e4" }),
    circle(0, 0, 56, { fill: p.accent }),
    circle(W, H, 200, { fill: "#0f766e" }),
    circle(W, H, 150, { fill: "#14b8a6" }),
    circle(W, H, 100, { fill: "#99f6e4" }),
    circle(W, H, 56, { fill: p.accent }),
    ...dots(W - 150, 40, 5, 4, 20, 3, "#14b8a6", 0.55),
    ...dots(40, 250, 3, 6, 20, 3, "#14b8a6", 0.4),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 560, qrPos: [48, 490] }),
  ];
  return layout(items, p.bg);
};

const techP: Palette = { name: "Teknologi", primary: "#1d4ed8", accent: "#06b6d4", bg: "#f6faff", ink: "#0b1b3a", muted: "#5b6b8a" };

const companyTech = (): Layout => {
  const p = techP;
  const items: Item[] = [];
  const cluster = (ox: number, oy: number, dir: 1 | -1) => {
    const r = 26;
    const w = r * Math.sqrt(3);
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 5 - row; col++) {
        const x = ox + dir * (col * w + (row % 2) * (w / 2));
        const y = oy + dir * row * r * 1.5;
        const t = (col + row) % 3;
        items.push(polyItem(hexPts(x, y, r - 2, 30), t === 0 ? "#1d4ed8" : t === 1 ? "#06b6d4" : "#bfdbfe", t === 2 ? 0.7 : 0.9 - row * 0.1));
      }
  };
  cluster(W - 26, 22, 1);
  cluster(26, H - 22, -1);
  const trace = (d: string, ex: number, ey: number) => [P(d, { stroke: "#38bdf8", sw: 1.8, opacity: 0.85, cap: "round" }), circle(ex, ey, 5, { fill: "#ffffff", stroke: "#06b6d4", sw: 2 })];
  items.push(
    ...trace("M40 60 L120 60 L150 90 L260 90", 260, 90),
    ...trace("M40 84 L90 84 L116 110 L116 160", 116, 160),
    ...trace(`M${W - 30} ${H - 30} L${W - 140} ${H - 30} L${W - 160} ${H - 46} L${W - 240} ${H - 46}`, W - 240, H - 46),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "sans-bold", maxW: 540, qrPos: [722, 468] }),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── PENDIDIKAN ─────────────────────────────
const eduP: Palette = { name: "Pendidikan", primary: "#7f1d1d", accent: "#b8860b", bg: "#fffdf6", ink: "#2b1414", muted: "#6b5a4a" };

const eduGraduate = (): Layout => {
  const p = eduP;
  const golds = ["#a16207", "#b8860b", "#d4a017", "#eab308"];
  const items: Item[] = [
    rect(18, 18, W - 36, H - 36, { stroke: p.primary, sw: 2 }),
    rect(26, 26, W - 52, H - 52, { stroke: p.accent, sw: 0.8 }),
    ...gradCap(112, 106, 54, -10),
    ...book(40, 520, 118, 20, "#7f1d1d"),
    ...book(48, 498, 104, 20, "#1e3a8a"),
    ...book(56, 476, 92, 20, "#166534"),
    ...sprig(W - 52, 60, 150, 190, golds),
    ...[0, 1, 2].map((i) => star(W - 60 - i * 26, 214 + i * 8, 7, p.accent)),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 520, qrPos: [722, 468] }),
  ];
  return layout(items, p.bg);
};

// ───────────────────────────── BATIK KAWUNG ─────────────────────────────
const batikP: Palette = { name: "Batik", primary: "#5b3a1e", accent: "#9a6b1f", bg: "#f5e8cb", ink: "#3b2412", muted: "#6b5236" };

const batikKawung = (): Layout => {
  const p = batikP;
  const items: Item[] = [rect(0, 0, W, H, { fill: "#ecd6a8", opacity: 1 }), rect(40, 40, W - 80, H - 80, { fill: p.bg })];
  const T = 40;
  const tile = (cx: number, cy: number) => items.push(...kawung(cx, cy, 17.5, p.primary, "#f3e1b8", 1.1, 1));
  for (let k = 0; k * T < W; k++) {
    tile(T / 2 + k * T, T / 2);
    tile(T / 2 + k * T, H - T / 2 + (H % T ? -(H % T) / 2 + 0 : 0));
  }
  for (let j = 1; j * T < H - T; j++) {
    tile(T / 2, T / 2 + j * T);
    tile(W - T / 2 + (W % T ? -(W % T) / 2 : 0), T / 2 + j * T);
  }
  items.push(
    rect(40, 40, W - 80, H - 80, { stroke: p.accent, sw: 2.2 }),
    rect(46, 46, W - 92, H - 92, { stroke: p.primary, sw: 0.7, opacity: 0.7 }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 520, qrPos: [716, 462] }).map((i): Item =>
      i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 538 } : i),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── ISLAMI ─────────────────────────────
const islamP: Palette = { name: "Islami", primary: "#065f46", accent: "#b8860b", bg: "#f4fbf6", ink: "#0d2a20", muted: "#4b6b5c" };

const islamicStar = (): Layout => {
  const p = islamP;
  const gold = "#d4af37";
  const items: Item[] = [rect(0, 0, W, 72, { fill: p.primary }), rect(0, 72, W, 4, { fill: gold }), rect(0, H - 34, W, 34, { fill: p.primary }), rect(0, H - 38, W, 4, { fill: gold })];
  for (let i = 0; i < 12; i++) {
    const x = 35 + i * 70;
    if (Math.abs(x - W / 2) < 60) continue;
    items.push(star(x, 36, 22, gold, 1, 8, 0.72, -22.5), star(x, 36, 12, p.primary, 1, 8, 0.72, 0));
    items.push(polyItem([[x + 35, 36 - 9], [x + 44, 36], [x + 35, 36 + 9], [x + 26, 36]], "#ffffff", 0.3));
  }
  for (let i = 0; i < 16; i++) items.push(star(26 + i * 52, H - 17, 9, gold, 0.95, 8, 0.72, -22.5));
  // bulan sabit + bintang di tengah pita atas
  items.push(circle(W / 2, 36, 24, { fill: gold }), circle(W / 2 + 9, 31, 20, { fill: p.primary }), star(W / 2 + 22, 28, 7, gold, 1, 5));
  items.push(
    rect(16, 92, W - 32, H - 144, { stroke: gold, sw: 1.2, opacity: 0.8 }),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 540, yShift: 10, qrPos: [722, 462] }).map((i): Item =>
      i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 541 } : i),
  );
  return layout(items, p.bg);
};

// ───────────────────────────── ANAK CERIA ─────────────────────────────
const kidsP: Palette = { name: "Anak Ceria", primary: "#2563eb", accent: "#f59e0b", bg: "#e0f2fe", ink: "#1e293b", muted: "#52667a" };

const kidsFun = (): Layout => {
  const p = kidsP;
  const items: Item[] = [
    circle(W - 70, 70, 34, { fill: "#fbbf24" }),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return line(W - 70 + 42 * Math.cos(a), 70 + 42 * Math.sin(a), W - 70 + 54 * Math.cos(a), 70 + 54 * Math.sin(a), "#fbbf24", 3.5);
    }),
    ...cloud(110, 70, 62),
    ...cloud(250, 40, 38, "#ffffff", 0.9),
    ...cloud(W - 230, 44, 44, "#ffffff", 0.9),
    ...balloon(36, 330, 24, "#ef4444", 2),
    ...balloon(66, 300, 21, "#3b82f6", -3),
    ...balloon(W - 40, 330, 24, "#a855f7", -2),
    ...balloon(W - 72, 304, 20, "#22c55e", 3),
    ...[[190, 150], [670, 140], [120, 450], [720, 420], [60, 420]].map(([x, y]) => star(x, y, 9, "#fbbf24", 0.9)),
    wave(0, W, 548, 5, 300, H, "#86efac", 0.95),
    wave(0, W, 560, 5, 240, H, "#4ade80", 1, 60),
    wave(0, W, 574, 5, 200, H, "#22c55e", 1, 110),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "sans-bold", nameFont: "serif-bold", maxW: 540, qrPos: [722, 456] }).map((i): Item =>
      i.type === "text" && i.source === "event:cert_number" ? { ...i, y: 586, color: "#ffffff" } : i),
  ];
  return layout(items, p.bg);
};

// ───────────────────────────── LINGKUNGAN ─────────────────────────────
const ecoP: Palette = { name: "Lingkungan", primary: "#166534", accent: "#0ea5e9", bg: "#f7fee7", ink: "#102a16", muted: "#4f6b52" };

const ecoGreen = (): Layout => {
  const p = ecoP;
  const g = ["#14532d", "#15803d", "#4d7c0f", "#65a30d"];
  const items: Item[] = [
    wave(0, W, 566, 4, 320, H, "#bbf7d0", 0.9),
    wave(0, W, 576, 4, 240, H, "#86efac", 0.95, 70),
    ...sprig(24, 24, 150, 135, g),
    ...sprig(W - 24, 24, 150, 225, g),
    ...sprig(150, 20, 90, 100, g.slice().reverse(), { flip: true }),
    ...sprig(W - 150, 20, 90, 260, g.slice().reverse(), { flip: true }),
    ...earth(72, H - 72, 54),
  ];
  // pohon
  [600, 640, 680, 760, 800].forEach((x, i) => {
    const h = 46 + (i % 3) * 8;
    items.push(rect(x - 3, H - 12 - 12, 6, 14, { fill: "#78350f" }));
    items.push(polyItem([[x - 18, H - 22], [x + 18, H - 22], [x, H - 22 - h * 0.6]], "#15803d"));
    items.push(polyItem([[x - 14, H - 22 - h * 0.35], [x + 14, H - 22 - h * 0.35], [x, H - 22 - h]], "#16a34a"));
  });
  items.push(...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 520, qrPos: [722, 452] }));
  return layout(items, p.bg);
};

// ───────────────────────────── SENI ─────────────────────────────
const artP: Palette = { name: "Seni", primary: "#7c3aed", accent: "#ec4899", bg: "#fffefb", ink: "#241338", muted: "#6d5a85" };

const artSplash = (): Layout => {
  const p = artP;
  const items: Item[] = [
    blob(70, 64, 120, 11, "#f472b6", 0.38),
    blob(138, 36, 84, 23, "#38bdf8", 0.38),
    blob(34, 150, 76, 37, "#facc15", 0.5),
    blob(W - 74, H - 66, 124, 51, "#a78bfa", 0.38),
    blob(W - 146, H - 34, 86, 67, "#34d399", 0.4),
    blob(W - 34, H - 150, 76, 83, "#fb923c", 0.5),
    P("M0 548 C 60 522, 110 576, 200 560", { stroke: "#ec4899", sw: 14, opacity: 0.45, cap: "round" }),
    P(`M${W} 120 C ${W - 70} 150, ${W - 120} 80, ${W - 230} 104`, { stroke: "#38bdf8", sw: 12, opacity: 0.45, cap: "round" }),
    ...[[190, 60, 5, "#f472b6"], [236, 110, 3.5, "#38bdf8"], [60, 250, 4, "#facc15"], [28, 300, 3, "#a78bfa"], [W - 190, H - 70, 5, "#a78bfa"], [W - 250, H - 120, 3.5, "#34d399"], [W - 60, 330, 4, "#fb923c"], [W - 30, 270, 3, "#ec4899"]].map(([x, y, r, c]) => circle(x as number, y as number, r as number, { fill: c as string, opacity: 0.8 })),
    ...compose({ palette: p, ax: W / 2, align: "center", titleFont: "serif-bold", nameFont: "script", maxW: 540, qrPos: [722, 452] }),
  ];
  return layout(items, p.bg);
};

export const THEMES_C: Theme[] = [
  { id: "company-skyline", name: "Korporat", build: companySkyline },
  { id: "company-modern", name: "Perusahaan Modern", build: companyModern },
  { id: "company-tech", name: "Teknologi", build: companyTech },
  { id: "edu-graduate", name: "Pendidikan", build: eduGraduate },
  { id: "batik-kawung", name: "Batik Kawung", build: batikKawung },
  { id: "islami-bintang", name: "Islami", build: islamicStar },
  { id: "kids-ceria", name: "Anak Ceria", build: kidsFun },
  { id: "eco-hijau", name: "Lingkungan", build: ecoGreen },
  { id: "art-splash", name: "Seni Warna", build: artSplash },
];
