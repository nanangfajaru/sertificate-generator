import "server-only";
import fs from "node:fs";
import path from "node:path";
import { LineCapStyle, PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/** Identitas penjual pada invoice (sementara; bisa dilengkapi nanti: badan usaha, alamat, NPWP). */
export const SELLER = {
  name: "SertifikatKu",
  site: "sertifikatku.com",
};

export type InvoiceData = {
  invoiceNo: string;
  orderId: string;
  paidAt: string;
  plan: "monthly" | "yearly" | string;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  voucherCode: string | null;
  /** masa berlaku Pro dari pembelian ini; end null = tanpa batas */
  period: { start: string; end: string | null } | null;
  /** mis. "Virtual Account BCA", "QRIS", "Voucher (gratis)" */
  paymentMethod: string;
  buyer: { name: string | null; email: string | null; organization: string | null };
};

/** Nomor invoice dari tanggal bayar + akhiran nomor pesanan, mis. INV/2026/10/AB12CD. */
export function invoiceNumber(orderId: string, paidAt: string) {
  const d = new Date(paidAt);
  const jkt = new Date(d.getTime() + 7 * 3600 * 1000); // WIB
  const suffix = orderId.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  return `INV/${jkt.getUTCFullYear()}/${String(jkt.getUTCMonth() + 1).padStart(2, "0")}/${suffix}`;
}

const NAVY = rgb(0.059, 0.114, 0.29); // #0f1d4a (warna lambang)
const GOLD = rgb(0.961, 0.702, 0.004); // #f5b301
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.39, 0.45, 0.55);
const LINE = rgb(0.89, 0.91, 0.94);
const GREEN = rgb(0.02, 0.59, 0.41);

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

/**
 * Lambang SertifikatKu (sama dengan src/components/Logo.tsx, versi latar terang) digambar sebagai vektor.
 * (x, top) = pojok kiri atas; tinggi = 38 × scale.
 */
function drawMark(page: PDFPage, x: number, top: number, scale: number) {
  const o = { x: x - 4 * scale, y: top + 13 * scale, scale };
  const fill = (d: string, color = NAVY, opacity = 1) => page.drawSvgPath(d, { ...o, color, opacity });
  const stroke = (d: string, color: ReturnType<typeof rgb>, w: number) => page.drawSvgPath(d, { ...o, borderColor: color, borderWidth: w * scale, borderLineCap: LineCapStyle.Round });
  const white = rgb(1, 1, 1);
  fill(rr(5, 15, 44, 34, 4.5));
  fill(rr(10, 22, 14, 3, 1.5), white);
  fill(rr(10, 28.5, 10, 2.4, 1.2), white, 0.45);
  fill(rr(10, 34, 12, 2.4, 1.2), white, 0.45);
  fill(rr(30, 18, 29, 29, 6), white);
  stroke("M33 26.98V23A2 2 0 0 1 35 21H38.98M50.02 21H54A2 2 0 0 1 56 23V26.98M56 38.02V42A2 2 0 0 1 54 44H50.02M38.98 44H35A2 2 0 0 1 33 42V38.02", GOLD, 2.4);
  // QR mini + centang (grup di Logo.tsx: translate(44.5 32.5) scale(.33) translate(-32 -32))
  for (const [qx, qy] of [[38.725, 26.725], [46.645, 26.725], [38.725, 34.645]]) stroke(rr(qx, qy, 3.63, 3.63, 0.99), NAVY, 1.65);
  fill("M45.16 36.46A3.3 3.3 0 1 0 51.76 36.46A3.3 3.3 0 1 0 45.16 36.46Z", GOLD);
  stroke("M46.81 36.559L47.998 37.747L50.176 35.371", NAVY, 1.188);
}

const idr = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
const longDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
const planName = (p: string) => (p === "yearly" ? "SertifikatKu Pro Tahunan" : p === "monthly" ? "SertifikatKu Pro Bulanan" : `SertifikatKu ${p}`);
const planPeriod = (d: InvoiceData) =>
  d.period ? `Masa berlaku: ${longDate(d.period.start)} – ${d.period.end ? longDate(d.period.end) : "tanpa batas"}` : d.plan === "yearly" ? "Masa aktif 1 tahun" : d.plan === "monthly" ? "Masa aktif 1 bulan" : "";

// Font dibaca sekali per instance server, bukan tiap invoice.
const fontCache = new Map<string, Buffer>();
const fontFile = (f: string) => {
  let b = fontCache.get(f);
  if (!b) fontCache.set(f, (b = fs.readFileSync(path.join(process.cwd(), "src", "fonts", f))));
  return b;
};

/** Bukti pembelian (invoice lunas) paket Pro dalam format PDF A4. */
export async function renderInvoicePdf(d: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Invoice ${d.invoiceNo}`);
  doc.setAuthor(SELLER.name);
  const reg = await doc.embedFont(fontFile("inter-latin-400-normal.woff"), { subset: true });
  const bold = await doc.embedFont(fontFile("inter-latin-700-normal.woff"), { subset: true });
  const page = doc.addPage([595.28, 841.89]);
  const W = page.getWidth();
  const M = 48;

  const text = (p: PDFPage, s: string, x: number, y: number, size: number, font: PDFFont = reg, color = INK) => p.drawText(s, { x, y, size, font, color });
  const right = (s: string, xRight: number, y: number, size: number, font: PDFFont = reg, color = INK) => text(page, s, xRight - font.widthOfTextAtSize(s, size), y, size, font, color);

  // Kepala: merek + judul dokumen
  page.drawRectangle({ x: 0, y: 841.89 - 6, width: W, height: 6, color: NAVY });
  page.drawRectangle({ x: 0, y: 841.89 - 8, width: W, height: 2, color: GOLD });
  drawMark(page, M, 796, 0.82);
  const tx = M + 56 * 0.82 + 10;
  text(page, "Sertifikat", tx, 773, 22, bold, INK);
  text(page, "Ku", tx + bold.widthOfTextAtSize("Sertifikat", 22), 773, 22, bold, GOLD);
  text(page, SELLER.site, tx, 757, 9, reg, MUTED);
  right("INVOICE", W - M, 772, 20, bold);
  right("Bukti pembelian", W - M, 755, 10, reg, MUTED);

  // Cap LUNAS
  const stamp = "LUNAS";
  const sw = bold.widthOfTextAtSize(stamp, 13) + 22;
  page.drawRectangle({ x: W - M - sw, y: 712, width: sw, height: 26, borderColor: GREEN, borderWidth: 1.5, color: rgb(0.93, 0.99, 0.96) });
  text(page, stamp, W - M - sw + 11, 720, 13, bold, GREEN);

  // Info invoice & pembeli
  let y = 690;
  page.drawLine({ start: { x: M, y: y + 10 }, end: { x: W - M, y: y + 10 }, thickness: 1, color: LINE });
  text(page, "DITAGIHKAN KEPADA", M, y - 8, 8, bold, MUTED);
  const buyerLines = [d.buyer.name, d.buyer.organization, d.buyer.email].filter(Boolean) as string[];
  buyerLines.forEach((l, i) => text(page, l, M, y - 26 - i * 15, i === 0 ? 11 : 10, i === 0 ? bold : reg));

  const info: [string, string][] = [
    ["No. invoice", d.invoiceNo],
    ["No. pesanan", d.orderId],
    ["Tanggal bayar", longDate(d.paidAt)],
    ["Metode pembayaran", d.paymentMethod],
  ];
  info.forEach(([k, v], i) => {
    const yy = y - 8 - i * 16;
    text(page, k, 330, yy, 9, reg, MUTED);
    right(v, W - M, yy, 9, bold);
  });

  // Tabel rincian
  y = 560;
  page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 24, color: rgb(0.97, 0.98, 0.99) });
  text(page, "DESKRIPSI", M + 10, y + 2, 8, bold, MUTED);
  right("JUMLAH", W - M - 10, y + 2, 8, bold, MUTED);
  y -= 34;
  text(page, planName(d.plan), M + 10, y, 11, bold);
  if (planPeriod(d)) text(page, planPeriod(d), M + 10, y - 15, 9, reg, MUTED);
  right(idr(d.baseAmount), W - M - 10, y, 11);
  y -= 40;
  if (d.discountAmount > 0) {
    text(page, `Diskon${d.voucherCode ? ` (voucher ${d.voucherCode})` : ""}`, M + 10, y, 10, reg, MUTED);
    right(`- ${idr(d.discountAmount)}`, W - M - 10, y, 10, reg, GREEN);
    y -= 24;
  }
  page.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 1, color: LINE });
  y -= 14;
  text(page, "Total dibayar", 330, y, 11, bold);
  right(idr(d.amount), W - M - 10, y, 14, bold, NAVY);

  // Catatan
  y -= 60;
  page.drawRectangle({ x: M, y: y - 34, width: W - 2 * M, height: 50, color: rgb(0.95, 0.96, 0.98) });
  page.drawRectangle({ x: M, y: y - 34, width: 3, height: 50, color: GOLD });
  text(page, `Terima kasih telah berlangganan ${SELLER.name} Pro.`, M + 14, y - 2, 10, bold, INK);
  text(page, `Dokumen ini adalah bukti sah bahwa pembelian di atas telah dilakukan dan dibayar lunas melalui ${SELLER.site}.`, M + 14, y - 18, 8.5, reg, MUTED);

  // Kaki
  text(page, `Dibuat otomatis oleh ${SELLER.name} pada ${longDate(new Date().toISOString())}. Tidak memerlukan tanda tangan.`, M, 48, 8, reg, MUTED);
  right(SELLER.site, W - M, 48, 8, bold, NAVY);

  return doc.save();
}
