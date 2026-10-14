import { qrMatrix } from "@/lib/certificate/qr";

const QUIET = 4;

/** SVG QR (modul gelap berwarna `fg`, latar putih) dengan zona tenang. */
export function qrSvg(text: string, fg = "#111827"): string {
  const m = qrMatrix(text);
  const n = m.length + QUIET * 2;
  let d = "";
  m.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}" fill="${fg}"/></svg>`;
}

/** PNG QR beresolusi tinggi (data URL). */
export function qrPngDataUrl(text: string, size = 1024, fg = "#111827"): string {
  const m = qrMatrix(text);
  const cells = m.length + QUIET * 2;
  const cell = Math.floor(size / cells);
  const px = cell * cells;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = fg;
  m.forEach((row, y) => row.forEach((on, x) => on && ctx.fillRect((x + QUIET) * cell, (y + QUIET) * cell, cell, cell)));
  return c.toDataURL("image/png");
}
