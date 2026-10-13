import type { Item } from "../types";

/** Pustaka ilustrasi vektor untuk template bertema. Koordinat satuan desain (y ke bawah). */

export type Pt = [number, number];
type Cmd = ["M" | "L", number, number] | ["C", number, number, number, number, number, number] | ["Q", number, number, number, number] | ["Z"];
export type Tf = { x?: number; y?: number; rot?: number; sx?: number; sy?: number };

const n2 = (n: number) => Math.round(n * 100) / 100;

export function tp(x: number, y: number, t: Tf = {}): Pt {
  const px = x * (t.sx ?? 1);
  const py = y * (t.sy ?? t.sx ?? 1);
  const a = ((t.rot ?? 0) * Math.PI) / 180;
  return [(t.x ?? 0) + px * Math.cos(a) - py * Math.sin(a), (t.y ?? 0) + px * Math.sin(a) + py * Math.cos(a)];
}

/** Menyusun string path dari perintah, setelah diterapkan transformasi (geser, putar searah jarum jam, skala). */
export function pathD(cmds: Cmd[], t: Tf = {}): string {
  return cmds
    .map((c) => {
      if (c[0] === "Z") return "Z";
      const pts: number[] = [];
      for (let i = 1; i < c.length; i += 2) {
        const [x, y] = tp(c[i] as number, c[i + 1] as number, t);
        pts.push(n2(x), n2(y));
      }
      return `${c[0]}${pts.join(" ")}`;
    })
    .join(" ");
}

type Paint = { fill?: string; stroke?: string; sw?: number; opacity?: number; cap?: "round" | "butt" };
export const P = (d: string, o: Paint): Item => ({ type: "path", d, ...o });

// ───────────────────────────── bentuk dasar ─────────────────────────────
const K = 0.5523;

export function ellipseD(cx: number, cy: number, rx: number, ry: number, rot = 0): string {
  const c: Cmd[] = [
    ["M", rx, 0],
    ["C", rx, ry * K, rx * K, ry, 0, ry],
    ["C", -rx * K, ry, -rx, ry * K, -rx, 0],
    ["C", -rx, -ry * K, -rx * K, -ry, 0, -ry],
    ["C", rx * K, -ry, rx, -ry * K, rx, 0],
    ["Z"],
  ];
  return pathD(c, { x: cx, y: cy, rot });
}

export function roundRectD(x: number, y: number, w: number, h: number, r: number, rot = 0): string {
  r = Math.min(r, w / 2, h / 2);
  const k = r * (1 - K);
  const c: Cmd[] = [
    ["M", -w / 2 + r, -h / 2],
    ["L", w / 2 - r, -h / 2],
    ["C", w / 2 - k, -h / 2, w / 2, -h / 2 + k, w / 2, -h / 2 + r],
    ["L", w / 2, h / 2 - r],
    ["C", w / 2, h / 2 - k, w / 2 - k, h / 2, w / 2 - r, h / 2],
    ["L", -w / 2 + r, h / 2],
    ["C", -w / 2 + k, h / 2, -w / 2, h / 2 - k, -w / 2, h / 2 - r],
    ["L", -w / 2, -h / 2 + r],
    ["C", -w / 2, -h / 2 + k, -w / 2 + k, -h / 2, -w / 2 + r, -h / 2],
    ["Z"],
  ];
  return pathD(c, { x: x + w / 2, y: y + h / 2, rot });
}

/** Panel membulat (latar teks di atas ilustrasi yang ramai). */
export const panel = (x: number, y: number, w: number, h: number, r: number, fill: string, opacity = 1, stroke?: string, sw = 1.5): Item => P(roundRectD(x, y, w, h, r), { fill, opacity, stroke, sw });

export function polyItem(points: Pt[], fill: string, opacity = 1): Item {
  return { type: "polygon", points: points.map(([x, y]) => [n2(x), n2(y)] as Pt), fill, opacity };
}

export function starPts(cx: number, cy: number, ro: number, ri: number, n = 5, rot = -90): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const r = i % 2 === 0 ? ro : ri;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
export const star = (cx: number, cy: number, ro: number, fill: string, opacity = 1, n = 5, ratio = 0.42, rot = -90): Item => polyItem(starPts(cx, cy, ro, ro * ratio, n, rot), fill, opacity);

export function ngonPts(cx: number, cy: number, r: number, n: number, rot = -90): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
}

export function hexPts(cx: number, cy: number, r: number, rot = 0): Pt[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((rot + 60 * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
}

export function plusPts(cx: number, cy: number, arm: number, th: number): Pt[] {
  const a = th / 2;
  return [[-a, -arm], [a, -arm], [a, -a], [arm, -a], [arm, a], [a, a], [a, arm], [-a, arm], [-a, a], [-arm, a], [-arm, -a], [-a, -a]].map(([x, y]) => [cx + x, cy + y] as Pt);
}

export function heartD(cx: number, cy: number, s: number, rot = 0): string {
  const c: Cmd[] = [
    ["M", 0, -0.3],
    ["C", -0.3, -0.85, -1, -0.55, -1, 0],
    ["C", -1, 0.5, -0.4, 0.8, 0, 1.1],
    ["C", 0.4, 0.8, 1, 0.5, 1, 0],
    ["C", 1, -0.55, 0.3, -0.85, 0, -0.3],
    ["Z"],
  ];
  return pathD(c, { x: cx, y: cy, rot, sx: s });
}

// ───────────────────────────── botani ─────────────────────────────
/** Kelopak bulat; ujung di (0,-len) lalu diputar. */
function petalCmds(len: number, w: number): Cmd[] {
  return [
    ["M", 0, 0],
    ["C", -w * 1.1, -len * 0.15, -w * 0.9, -len * 0.98, 0, -len * 0.98],
    ["C", w * 0.9, -len * 0.98, w * 1.1, -len * 0.15, 0, 0],
    ["Z"],
  ];
}
function leafCmds(len: number, w: number): Cmd[] {
  return [
    ["M", 0, 0],
    ["C", -w, -len * 0.25, -w * 0.75, -len * 0.75, 0, -len],
    ["C", w * 0.75, -len * 0.75, w, -len * 0.25, 0, 0],
    ["Z"],
  ];
}
function notchPetalCmds(len: number, w: number): Cmd[] {
  return [
    ["M", 0, 0],
    ["C", -w * 1.1, -len * 0.2, -w * 1.0, -len * 0.92, -w * 0.15, -len],
    ["L", 0, -len * 0.88],
    ["L", w * 0.15, -len],
    ["C", w * 1.0, -len * 0.92, w * 1.1, -len * 0.2, 0, 0],
    ["Z"],
  ];
}

export const leaf = (x: number, y: number, len: number, w: number, rot: number, fill: string, opacity = 1, vein?: string): Item[] => {
  const items: Item[] = [P(pathD(leafCmds(len, w), { x, y, rot }), { fill, opacity })];
  if (vein) items.push(P(pathD([["M", 0, 0], ["L", 0, -len * 0.92]], { x, y, rot }), { stroke: vein, sw: Math.max(0.8, len * 0.02), opacity: 0.6, cap: "round" }));
  return items;
};

export function ring(cx: number, cy: number, r: number, n: number, mk: (x: number, y: number, a: number, i: number) => Item[], startDeg = 0): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < n; i++) {
    const a = startDeg + (360 / n) * i;
    out.push(...mk(cx, cy, a, i));
  }
  return out;
}

export function rose(cx: number, cy: number, R: number, c: [string, string, string, string]): Item[] {
  const items: Item[] = [];
  items.push(...ring(cx, cy, R, 7, (x, y, a) => [P(pathD(petalCmds(R, R * 0.55), { x, y, rot: a }), { fill: c[0], stroke: c[2], sw: 0.8, opacity: 1 })]));
  items.push(...ring(cx, cy, R, 6, (x, y, a) => [P(pathD(petalCmds(R * 0.72, R * 0.42), { x, y, rot: a }), { fill: c[1], stroke: c[2], sw: 0.7 })], 25));
  items.push(...ring(cx, cy, R, 5, (x, y, a) => [P(pathD(petalCmds(R * 0.46, R * 0.3), { x, y, rot: a }), { fill: c[2], opacity: 0.95 })], 10));
  items.push({ type: "circle", cx, cy, r: R * 0.16, fill: c[3] });
  items.push(P(pathD([["M", -R * 0.12, 0], ["C", -R * 0.1, -R * 0.14, R * 0.12, -R * 0.14, R * 0.12, 0]], { x: cx, y: cy }), { stroke: c[2], sw: Math.max(0.8, R * 0.025), cap: "round" }));
  return items;
}

export function sakura(cx: number, cy: number, R: number, rot = 0, fill = "#fbcfe8", edge = "#f472b6", center = "#be185d"): Item[] {
  const items: Item[] = ring(cx, cy, R, 5, (x, y, a) => [P(pathD(notchPetalCmds(R, R * 0.5), { x, y, rot: a + rot }), { fill, stroke: edge, sw: Math.max(0.7, R * 0.03) })]);
  items.push(...ring(cx, cy, R, 5, (x, y, a) => {
    const [ex, ey] = tp(0, -R * 0.38, { x, y, rot: a + rot + 36 });
    return [P(`M${n2(x)} ${n2(y)} L${n2(ex)} ${n2(ey)}`, { stroke: center, sw: Math.max(0.6, R * 0.02), opacity: 0.7, cap: "round" }), { type: "circle", cx: n2(ex), cy: n2(ey), r: Math.max(0.8, R * 0.045), fill: center } as Item];
  }));
  items.push({ type: "circle", cx, cy, r: R * 0.1, fill: center, opacity: 0.85 });
  return items;
}

export function sunflower(cx: number, cy: number, R: number): Item[] {
  const items: Item[] = [];
  items.push(...ring(cx, cy, R, 22, (x, y, a) => [P(pathD(leafCmds(R, R * 0.2), { x, y, rot: a }), { fill: "#f59e0b", stroke: "#b45309", sw: 0.6 })]));
  items.push(...ring(cx, cy, R, 22, (x, y, a) => [P(pathD(leafCmds(R * 0.9, R * 0.2), { x, y, rot: a }), { fill: "#fbbf24", stroke: "#d97706", sw: 0.5 })], 8.2));
  items.push({ type: "circle", cx, cy, r: R * 0.42, fill: "#78350f" });
  items.push({ type: "circle", cx, cy, r: R * 0.34, fill: "#5b2a0c" });
  // biji: spiral phyllotaxis
  for (let i = 1; i < 70; i++) {
    const a = i * 2.39996;
    const r = R * 0.33 * Math.sqrt(i / 70);
    items.push({ type: "circle", cx: n2(cx + r * Math.cos(a)), cy: n2(cy + r * Math.sin(a)), r: Math.max(0.8, R * 0.022), fill: i % 3 ? "#a16207" : "#3f1d0b" });
  }
  return items;
}

/** Ranting berdaun: batang melengkung + daun berselang-seling. */
export function sprig(x: number, y: number, len: number, rot: number, greens: string[], opts: { berries?: string; flip?: boolean } = {}): Item[] {
  const f = opts.flip ? -1 : 1;
  const items: Item[] = [P(pathD([["M", 0, 0], ["C", 6 * f, -len * 0.3, -6 * f, -len * 0.65, 0, -len]], { x, y, rot }), { stroke: greens[0], sw: Math.max(1.4, len * 0.018), cap: "round" })];
  const n = Math.max(4, Math.round(len / 22));
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const [px, py] = tp(0, -len * t, { x, y, rot });
    const side = i % 2 === 0 ? 1 : -1;
    const ll = len * 0.2 * (1 - t * 0.35);
    items.push(...leaf(px, py, ll, ll * 0.36, rot + side * 52, greens[i % greens.length], 0.95, greens[0]));
  }
  const [tx, ty] = tp(0, -len, { x, y, rot });
  items.push(...leaf(tx, ty, len * 0.17, len * 0.06, rot, greens[1 % greens.length], 0.95));
  if (opts.berries) for (let i = 0; i < 3; i++) items.push({ type: "circle", cx: n2(tx + (i - 1) * 5), cy: n2(ty - 6 - (i % 2) * 5), r: 3.2, fill: opts.berries });
  return items;
}

/** Karangan daun (laurel) sepanjang busur lingkaran. */
export function laurel(cx: number, cy: number, R: number, a0: number, a1: number, n: number, fill: string, opacity = 1): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1);
    const rad = (a * Math.PI) / 180;
    const x = cx + R * Math.cos(rad);
    const y = cy + R * Math.sin(rad);
    const dir = a + 90 + (a1 > a0 ? 0 : 180);
    const L = R * 0.2;
    items.push(P(pathD(leafCmds(L, L * 0.38), { x, y, rot: dir - 25 }), { fill, opacity }));
    items.push(P(pathD(leafCmds(L * 0.85, L * 0.34), { x, y, rot: dir + 155 }), { fill, opacity: opacity * 0.9 }));
  }
  return items;
}

// ───────────────────────────── olahraga ─────────────────────────────
export function soccerBall(cx: number, cy: number, r: number): Item[] {
  const ink = "#1f2937";
  const sw = Math.max(1, r * 0.05);
  const items: Item[] = [
    { type: "circle", cx: cx + r * 0.08, cy: cy + r * 0.12, r: r * 1.02, fill: "#000", opacity: 0.18 },
    { type: "circle", cx, cy, r, fill: "#ffffff", stroke: ink, sw },
    polyItem(ngonPts(cx, cy, r * 0.36, 5, -90), ink),
  ];
  for (let i = 0; i < 5; i++) {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    const [vx, vy] = [cx + r * 0.36 * Math.cos(a), cy + r * 0.36 * Math.sin(a)];
    const [ex, ey] = [cx + r * 0.66 * Math.cos(a), cy + r * 0.66 * Math.sin(a)];
    items.push(P(`M${n2(vx)} ${n2(vy)} L${n2(ex)} ${n2(ey)}`, { stroke: ink, sw, cap: "round" }));
    const [px, py] = [cx + r * 0.84 * Math.cos(a), cy + r * 0.84 * Math.sin(a)];
    items.push(polyItem(ngonPts(px, py, r * 0.2, 5, -90 + i * 72 + 36 + 180), ink));
  }
  return items;
}

export function basketball(cx: number, cy: number, r: number): Item[] {
  const dark = "#7c2d12";
  const sw = Math.max(1.2, r * 0.055);
  return [
    { type: "circle", cx: cx + r * 0.08, cy: cy + r * 0.12, r: r * 1.02, fill: "#000", opacity: 0.16 },
    { type: "circle", cx, cy, r, fill: "#ea7a2b", stroke: dark, sw },
    P(`M${n2(cx)} ${n2(cy - r)} L${n2(cx)} ${n2(cy + r)}`, { stroke: dark, sw, cap: "round" }),
    P(`M${n2(cx - r)} ${n2(cy)} L${n2(cx + r)} ${n2(cy)}`, { stroke: dark, sw, cap: "round" }),
    P(`M${n2(cx - r * 0.7)} ${n2(cy - r * 0.71)} Q${n2(cx - r * 0.2)} ${n2(cy)} ${n2(cx - r * 0.7)} ${n2(cy + r * 0.71)}`, { stroke: dark, sw, cap: "round" }),
    P(`M${n2(cx + r * 0.7)} ${n2(cy - r * 0.71)} Q${n2(cx + r * 0.2)} ${n2(cy)} ${n2(cx + r * 0.7)} ${n2(cy + r * 0.71)}`, { stroke: dark, sw, cap: "round" }),
  ];
}

export function shuttlecock(cx: number, cy: number, s: number, rot: number): Item[] {
  const t: Tf = { x: cx, y: cy, rot };
  const items: Item[] = [];
  items.push(P(pathD([["M", -0.22, -0.1], ["L", -0.62, -1.2], ["Q", 0, -1.45, 0.62, -1.2], ["L", 0.22, -0.1], ["Z"]], { ...t, sx: s }), { fill: "#ffffff", stroke: "#94a3b8", sw: Math.max(1, s * 0.02) }));
  for (let i = -3; i <= 3; i++) items.push(P(pathD([["M", i * 0.075, -0.1], ["L", i * 0.2, -1.28]], { ...t, sx: s }), { stroke: "#94a3b8", sw: Math.max(0.8, s * 0.014), cap: "round" }));
  items.push(P(pathD([["M", -0.64, -1.17], ["Q", 0, -1.43, 0.64, -1.17]], { ...t, sx: s }), { stroke: "#ef4444", sw: Math.max(1.5, s * 0.05), cap: "round" }));
  items.push(P(ellipseD(...tp(0, 0.02, { ...t, sx: s }), s * 0.25, s * 0.2, rot), { fill: "#f59e0b", stroke: "#b45309", sw: Math.max(1, s * 0.02) }));
  return items;
}

export function racket(cx: number, cy: number, s: number, rot: number, color: string): Item[] {
  const t: Tf = { x: cx, y: cy, rot, sx: s };
  const items: Item[] = [];
  const rx = 0.7, ry = 0.95;
  for (let i = -5; i <= 5; i++) {
    const x = (i / 5.6) * rx;
    const h = ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2));
    items.push(P(pathD([["M", x, -h], ["L", x, h]], t), { stroke: "#94a3b8", sw: Math.max(0.6, s * 0.012) }));
    const y = (i / 5.6) * ry;
    const w = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
    items.push(P(pathD([["M", -w, y], ["L", w, y]], t), { stroke: "#94a3b8", sw: Math.max(0.6, s * 0.012) }));
  }
  items.push(P(ellipseD(cx, cy, rx * s, ry * s, rot), { stroke: color, sw: Math.max(2, s * 0.09) }));
  items.push(P(pathD([["M", 0, ry], ["L", 0, 1.55]], t), { stroke: color, sw: Math.max(2, s * 0.08), cap: "round" }));
  items.push(P(pathD([["M", 0, 1.35], ["L", 0, 2.05]], t), { stroke: "#1f2937", sw: Math.max(3, s * 0.14), cap: "round" }));
  return items;
}

/** Gelombang terisi: dari y ke bawah (bottom). */
export function wave(x0: number, x1: number, y: number, amp: number, wl: number, bottom: number, fill: string, opacity = 1, phase = 0): Item {
  let d = `M${x0} ${n2(y)}`;
  const steps = Math.ceil((x1 - x0) / wl) * 2 + 2;
  for (let i = 0; i < steps; i++) {
    const xa = x0 - phase + (i * wl) / 2;
    const xb = xa + wl / 2;
    d += ` Q${n2(xa + wl / 4)} ${n2(y + (i % 2 === 0 ? -amp * 2 : amp * 2))} ${n2(xb)} ${n2(y)}`;
  }
  d += ` L${x1 + wl} ${bottom} L${x0 - wl} ${bottom} Z`;
  return P(d, { fill, opacity });
}

export function cloud(cx: number, cy: number, s: number, fill = "#ffffff", opacity = 1): Item[] {
  return [
    { type: "circle", cx: cx - s * 0.55, cy: cy + s * 0.1, r: s * 0.42, fill, opacity },
    { type: "circle", cx: cx - s * 0.1, cy: cy - s * 0.18, r: s * 0.55, fill, opacity },
    { type: "circle", cx: cx + s * 0.5, cy: cy, r: s * 0.46, fill, opacity },
    { type: "rect", x: cx - s * 0.55, y: cy + s * 0.05, w: s * 1.05, h: s * 0.47, fill, opacity },
  ];
}

export function balloon(cx: number, cy: number, r: number, fill: string, lean = 0): Item[] {
  return [
    P(`M${n2(cx)} ${n2(cy + r * 1.35)} Q${n2(cx + 14 + lean)} ${n2(cy + r * 2.2)} ${n2(cx - 6 + lean * 2)} ${n2(cy + r * 3.1)}`, { stroke: "#64748b", sw: 1.2, cap: "round" }),
    P(ellipseD(cx, cy, r * 0.82, r, lean * 0.4), { fill }),
    polyItem([[cx, cy + r * 1.0], [cx - r * 0.18, cy + r * 1.3], [cx + r * 0.18, cy + r * 1.3]], fill),
    P(ellipseD(cx - r * 0.3, cy - r * 0.35, r * 0.14, r * 0.26, -25), { fill: "#ffffff", opacity: 0.45 }),
  ];
}

export function capsule(cx: number, cy: number, w: number, h: number, rot: number, c1: string, c2: string): Item[] {
  return [
    P(roundRectD(cx - w / 2, cy - h / 2, w, h, h / 2, rot), { fill: c1, stroke: "#ffffff", sw: 1.5 }),
    P(pathD([["M", 0, -h / 2], ["L", w / 2 - h / 2, -h / 2], ["C", w / 2 - h / 2 + h * 0.28, -h / 2, w / 2, -h * 0.28, w / 2, 0], ["C", w / 2, h * 0.28, w / 2 - h / 2 + h * 0.28, h / 2, w / 2 - h / 2, h / 2], ["L", 0, h / 2], ["Z"]], { x: cx, y: cy, rot }), { fill: c2 }),
  ];
}

/** Siluet gedung dengan jendela. */
export function skyline(x0: number, x1: number, baseY: number, seed: number, minH: number, maxH: number, fill: string, win: string, opacity = 1): Item[] {
  const items: Item[] = [];
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  let x = x0;
  while (x < x1) {
    const w = 18 + Math.floor(rnd() * 26);
    const h = minH + rnd() * (maxH - minH);
    items.push({ type: "rect", x: n2(x), y: n2(baseY - h), w, h: n2(h), fill, opacity });
    if (rnd() > 0.6) items.push({ type: "rect", x: n2(x + w * 0.35), y: n2(baseY - h - 10), w: n2(w * 0.3), h: 10, fill, opacity });
    for (let wy = baseY - h + 8; wy < baseY - 10; wy += 11)
      for (let wx = x + 4; wx < x + w - 5; wx += 8) if (rnd() > 0.35) items.push({ type: "rect", x: n2(wx), y: n2(wy), w: 4, h: 5, fill: win, opacity: 0.55 });
    x += w + 2;
  }
  return items;
}

/** Garis lapangan: persegi panjang + garis tengah + lingkaran tengah. */
export function dots(x0: number, y0: number, cols: number, rows: number, gap: number, r: number, fill: string, opacity = 1): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) out.push({ type: "circle", cx: x0 + i * gap, cy: y0 + j * gap, r, fill, opacity });
  return out;
}

export function earth(cx: number, cy: number, r: number): Item[] {
  const t: Tf = { x: cx, y: cy, sx: r };
  return [
    { type: "circle", cx, cy, r, fill: "#38bdf8", stroke: "#0369a1", sw: Math.max(1, r * 0.04) },
    P(pathD([["M", -0.55, -0.35], ["C", -0.4, -0.7, 0, -0.75, 0.15, -0.5], ["C", 0.1, -0.3, -0.1, -0.2, -0.05, 0], ["C", -0.2, 0.2, -0.5, 0.1, -0.55, -0.35], ["Z"]], t), { fill: "#4ade80" }),
    P(pathD([["M", 0.2, -0.1], ["C", 0.5, -0.25, 0.8, -0.05, 0.7, 0.3], ["C", 0.55, 0.45, 0.3, 0.35, 0.2, 0.1], ["Z"]], t), { fill: "#22c55e" }),
    P(pathD([["M", -0.3, 0.35], ["C", -0.1, 0.3, 0.05, 0.5, -0.05, 0.75], ["C", -0.25, 0.8, -0.4, 0.6, -0.3, 0.35], ["Z"]], t), { fill: "#4ade80" }),
    P(ellipseD(cx - r * 0.38, cy - r * 0.45, r * 0.12, r * 0.22, -35), { fill: "#ffffff", opacity: 0.35 }),
  ];
}

export function gradCap(cx: number, cy: number, s: number, rot: number, board = "#1f2937", accent = "#b8860b"): Item[] {
  const t: Tf = { x: cx, y: cy, rot, sx: s };
  return [
    P(pathD([["M", -0.62, 0.05], ["L", -0.62, 0.55], ["Q", 0, 0.95, 0.62, 0.55], ["L", 0.62, 0.05], ["L", 0, 0.38], ["Z"]], t), { fill: board, opacity: 0.92 }),
    P(pathD([["M", 0, -0.55], ["L", 1.25, 0], ["L", 0, 0.55], ["L", -1.25, 0], ["Z"]], t), { fill: board, stroke: "#000", sw: 0.6, opacity: 1 }),
    P(pathD([["M", 0, 0], ["L", 1.05, 0.1], ["L", 1.05, 0.62]], t), { stroke: accent, sw: Math.max(1.5, s * 0.05), cap: "round" }),
    { type: "circle", cx: n2(tp(1.05, 0.66, t)[0]), cy: n2(tp(1.05, 0.66, t)[1]), r: Math.max(2.5, s * 0.08), fill: accent },
  ];
}

export function book(x: number, y: number, w: number, h: number, cover: string, pages = "#fef3c7"): Item[] {
  return [
    { type: "rect", x, y, w, h, fill: cover },
    { type: "rect", x: x + w * 0.06, y: y + h * 0.14, w: w * 0.88, h: h * 0.72, fill: pages },
    { type: "rect", x, y, w: w * 0.1, h, fill: "#000", opacity: 0.18 },
  ];
}

export function kawung(cx: number, cy: number, r: number, stroke: string, fill?: string, sw = 1.2, opacity = 1): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < 4; i++) {
    const a = i * 90;
    const [ex, ey] = tp(0, -r * 0.5, { x: cx, y: cy, rot: a });
    items.push(P(ellipseD(ex, ey, r * 0.24, r * 0.5, a), { fill, stroke, sw, opacity }));
  }
  items.push({ type: "circle", cx, cy, r: r * 0.1, fill: stroke, opacity });
  return items;
}

export function blob(cx: number, cy: number, r: number, seed: number, fill: string, opacity: number): Item {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const n = 8;
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.72 + rnd() * 0.45);
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as Pt;
  });
  // Catmull-Rom → Bezier tertutup
  let d = `M${n2(pts[0][0])} ${n2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${n2(p1[0] + (p2[0] - p0[0]) / 6)} ${n2(p1[1] + (p2[1] - p0[1]) / 6)} ${n2(p2[0] - (p3[0] - p1[0]) / 6)} ${n2(p2[1] - (p3[1] - p1[1]) / 6)} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return P(d + " Z", { fill, opacity });
}
