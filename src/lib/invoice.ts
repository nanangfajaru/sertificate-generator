import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
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
  buyer: { name: string | null; email: string | null; organization: string | null };
};

/** Nomor invoice dari tanggal bayar + akhiran nomor pesanan, mis. INV/2026/10/AB12CD. */
export function invoiceNumber(orderId: string, paidAt: string) {
  const d = new Date(paidAt);
  const jkt = new Date(d.getTime() + 7 * 3600 * 1000); // WIB
  const suffix = orderId.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  return `INV/${jkt.getUTCFullYear()}/${String(jkt.getUTCMonth() + 1).padStart(2, "0")}/${suffix}`;
}

const INDIGO = rgb(0.118, 0.271, 0.706); // navy brand #1e45b4
const INK = rgb(0.06, 0.09, 0.16);
const MUTED = rgb(0.39, 0.45, 0.55);
const LINE = rgb(0.89, 0.91, 0.94);
const GREEN = rgb(0.02, 0.59, 0.41);

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
  page.drawRectangle({ x: 0, y: 841.89 - 6, width: W, height: 6, color: INDIGO });
  text(page, "Sertifikat", M, 770, 22, bold);
  text(page, "Ku", M + bold.widthOfTextAtSize("Sertifikat", 22), 770, 22, bold, INDIGO);
  text(page, SELLER.site, M, 752, 9, reg, MUTED);
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
    ["Metode pembayaran", d.amount > 0 ? "Online" : "Voucher (gratis)"],
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
  right(idr(d.amount), W - M - 10, y, 14, bold, INDIGO);

  // Catatan
  y -= 60;
  page.drawRectangle({ x: M, y: y - 34, width: W - 2 * M, height: 50, color: rgb(0.94, 0.95, 1) });
  text(page, `Terima kasih telah berlangganan ${SELLER.name} Pro.`, M + 14, y - 2, 10, bold, INK);
  text(page, `Dokumen ini adalah bukti sah bahwa pembelian di atas telah dilakukan dan dibayar lunas melalui ${SELLER.site}.`, M + 14, y - 18, 8.5, reg, MUTED);

  // Kaki
  text(page, `Dibuat otomatis oleh ${SELLER.name} pada ${longDate(new Date().toISOString())}. Tidak memerlukan tanda tangan.`, M, 48, 8, reg, MUTED);
  right(SELLER.site, W - M, 48, 8, bold, INDIGO);

  return doc.save();
}
