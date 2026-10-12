import QRCode from "qrcode";

/** Matriks modul QR (true = gelap). */
export function qrMatrix(text: string): boolean[][] {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const rows: boolean[][] = [];
  for (let y = 0; y < n; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < n; x++) row.push(!!qr.modules.get(x, y));
    rows.push(row);
  }
  return rows;
}
