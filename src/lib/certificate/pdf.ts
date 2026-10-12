import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FONT_FILE } from "./fonts";
import { qrMatrix } from "./qr";
import type { FontKey, Layout, TextItem } from "./types";

export type Background =
  | { kind: "pdf"; bytes: Uint8Array }
  | { kind: "png" | "jpg"; bytes: Uint8Array }
  | null;

const fontBytes = new Map<FontKey, Buffer>();
function loadFont(key: FontKey) {
  let b = fontBytes.get(key);
  if (!b) {
    b = fs.readFileSync(path.join(process.cwd(), "src", "fonts", FONT_FILE[key]));
    fontBytes.set(key, b);
  }
  return b;
}

function hex(c: string) {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(c.trim());
  if (!m) return rgb(0, 0, 0);
  let h = m[1];
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  return rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
}

/** Font tertanam hanya Latin: samakan tanda baca umum, buang karakter kontrol. */
function clean(s: string) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[\u0000-\u001F\u007F]/g, " ");
}

function textWidth(font: PDFFont, text: string, size: number, spacing: number) {
  return font.widthOfTextAtSize(text, size) + spacing * Math.max(0, [...text].length - 1);
}

function drawText(page: PDFPage, font: PDFFont, it: TextItem, s: number, H: number) {
  const text = clean(it.text ?? "");
  if (!text) return;
  let size = it.size * s;
  let sp = (it.spacing ?? 0) * s;
  let w = textWidth(font, text, size, sp);
  if (it.maxWidth && w > it.maxWidth * s) {
    const k = (it.maxWidth * s) / w;
    size *= k;
    sp *= k;
    w = textWidth(font, text, size, sp);
  }
  let x = it.x * s;
  if (it.align === "center") x -= w / 2;
  else if (it.align === "right") x -= w;
  const y = H - it.y * s;
  const color = hex(it.color);
  const opacity = it.opacity ?? 1;
  if (!sp) {
    page.drawText(text, { x, y, size, font, color, opacity });
    return;
  }
  let cx = x;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color, opacity });
    cx += font.widthOfTextAtSize(ch, size) + sp;
  }
}

/** Menggambar layout yang sudah di-resolve ke PDF. Satu halaman. */
export async function renderCertificatePdf(layout: Layout, bg: Background): Promise<Uint8Array> {
  let doc: PDFDocument;
  let page: PDFPage;

  if (bg?.kind === "pdf") {
    doc = await PDFDocument.load(bg.bytes, { ignoreEncryption: true });
    for (let i = doc.getPageCount() - 1; i > 0; i--) doc.removePage(i);
    page = doc.getPage(0);
  } else {
    doc = await PDFDocument.create();
    const pw = 842;
    page = doc.addPage([pw, (pw * layout.height) / layout.width]);
    if (bg) {
      const img = bg.kind === "png" ? await doc.embedPng(bg.bytes) : await doc.embedJpg(bg.bytes);
      page.drawImage(img, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
    } else {
      page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: hex(layout.bg ?? "#ffffff") });
    }
  }

  doc.registerFontkit(fontkit);
  const { width: PW, height: PH } = page.getSize();
  const s = PW / layout.width;

  const fonts = new Map<FontKey, PDFFont>();
  const getFont = async (k: FontKey) => {
    let f = fonts.get(k);
    if (!f) {
      f = await doc.embedFont(loadFont(k), { subset: true });
      fonts.set(k, f);
    }
    return f;
  };

  for (const it of layout.items) {
    switch (it.type) {
      case "rect":
        page.drawRectangle({
          x: it.x * s,
          y: PH - (it.y + it.h) * s,
          width: it.w * s,
          height: it.h * s,
          color: it.fill ? hex(it.fill) : undefined,
          borderColor: it.stroke ? hex(it.stroke) : undefined,
          borderWidth: it.stroke ? (it.sw ?? 1) * s : 0,
          opacity: it.opacity ?? 1,
          borderOpacity: it.opacity ?? 1,
        });
        break;
      case "line":
        page.drawLine({
          start: { x: it.x1 * s, y: PH - it.y1 * s },
          end: { x: it.x2 * s, y: PH - it.y2 * s },
          thickness: (it.sw ?? 1) * s,
          color: hex(it.stroke),
          opacity: it.opacity ?? 1,
        });
        break;
      case "circle":
        page.drawCircle({
          x: it.cx * s,
          y: PH - it.cy * s,
          size: it.r * s,
          color: it.fill ? hex(it.fill) : undefined,
          borderColor: it.stroke ? hex(it.stroke) : undefined,
          borderWidth: it.stroke ? (it.sw ?? 1) * s : 0,
          opacity: it.opacity ?? 1,
          borderOpacity: it.opacity ?? 1,
        });
        break;
      case "polygon": {
        const d = it.points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ") + " Z";
        page.drawSvgPath(d, { x: 0, y: PH, scale: s, color: hex(it.fill), opacity: it.opacity ?? 1 });
        break;
      }
      case "qr": {
        if (!it.url) break;
        const m = qrMatrix(it.url);
        const c = (it.size * s) / m.length;
        const pad = 2 * s;
        page.drawRectangle({ x: it.x * s - pad, y: PH - (it.y + it.size) * s - pad, width: it.size * s + pad * 2, height: it.size * s + pad * 2, color: rgb(1, 1, 1) });
        const col = hex(it.color);
        m.forEach((row, ry) =>
          row.forEach((on, rx) => {
            if (on) page.drawRectangle({ x: it.x * s + rx * c, y: PH - it.y * s - (ry + 1) * c, width: c + 0.2, height: c + 0.2, color: col });
          }),
        );
        break;
      }
      case "text":
        drawText(page, await getFont(it.font), it, s, PH);
        break;
    }
  }

  return doc.save();
}
