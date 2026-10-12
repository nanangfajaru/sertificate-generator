import type { FontKey } from "./types";

/** Nama family & weight CSS (sinkron dengan @font-face di globals.css) */
export const CSS_FONT: Record<FontKey, { family: string; weight: number }> = {
  sans: { family: "CertInter, sans-serif", weight: 400 },
  "sans-bold": { family: "CertInter, sans-serif", weight: 700 },
  serif: { family: "CertPlayfair, serif", weight: 400 },
  "serif-bold": { family: "CertPlayfair, serif", weight: 700 },
  script: { family: "CertScript, cursive", weight: 400 },
};

export const FONT_FILE: Record<FontKey, string> = {
  sans: "inter-latin-400-normal.woff",
  "sans-bold": "inter-latin-700-normal.woff",
  serif: "playfair-display-latin-400-normal.woff",
  "serif-bold": "playfair-display-latin-700-normal.woff",
  script: "great-vibes-latin-400-normal.woff",
};
