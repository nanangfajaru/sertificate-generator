import type { CertContext } from "./certificate/sources";
import type { Layout } from "./certificate/types";

export type DesignDTO = {
  id: string;
  name: string;
  kind: "pdf" | "png" | "jpg";
  layout: Layout;
  previewUrl: string | null;
  updatedAt: string;
};

/** Batas desain di pustaka pengguna (dijaga juga oleh trigger database). */
export const DESIGN_LIMITS = { free: 5, pro: 50 } as const;

/** Layout awal untuk desain baru: nama peserta, kegiatan, tanggal, nomor, dan QR. Satuan desain: lebar 1000. */
export function defaultCustomLayout(height: number): Layout {
  const c = "#1f2937";
  return {
    width: 1000,
    height,
    items: [
      { type: "text", id: "t-name", x: 500, y: Math.round(height * 0.5), size: 64, font: "script", color: c, align: "center", source: "slot:name", maxWidth: 800 },
      { type: "text", id: "t-event", x: 500, y: Math.round(height * 0.62), size: 28, font: "serif-bold", color: c, align: "center", source: "event:event_name", maxWidth: 800 },
      { type: "text", id: "t-date", x: 500, y: Math.round(height * 0.68), size: 18, font: "sans", color: "#4b5563", align: "center", source: "event:date_location", maxWidth: 800 },
      { type: "text", id: "t-no", x: 500, y: height - 40, size: 14, font: "sans", color: "#4b5563", align: "center", source: "event:cert_number", prefix: "No. " },
      { type: "qr", id: "t-qr", x: 900, y: height - 110, size: 70, color: "#111827" },
    ],
  };
}

/** Data contoh untuk pustaka desain (di luar program). */
export function librarySample(verifyUrl: string): CertContext {
  return {
    program: {
      org_name: "Nama Instansi",
      name: "Nama Kegiatan",
      cert_type: "Sertifikat Peserta",
      description: "Atas partisipasinya sebagai peserta dalam kegiatan ini.",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      location: "Kota",
      signer1_name: "Nama Penandatangan",
      signer1_title: "Jabatan",
      signer2_name: null,
      signer2_title: null,
      mapping: { name: "_name" },
    },
    data: { _name: "Nama Peserta Contoh" },
    certNumber: "001/SERT/I/2026",
    verifyUrl,
  };
}

export type ForeignField = { label: string; isName: boolean };

/**
 * Menyesuaikan desain dengan program tujuan. Sumber `field:<id>` dari program lain dipetakan:
 * field nama → `slot:name`; field lain dicocokkan lewat label; yang tidak cocok dibuang.
 */
export function adaptLayout(layout: Layout, target: { fields: { id: string; label: string }[] }, foreign: Map<string, ForeignField>): Layout {
  const ids = new Set(target.fields.map((f) => f.id));
  const byLabel = new Map(target.fields.map((f) => [f.label.trim().toLowerCase(), f.id]));
  const items = layout.items.flatMap((it) => {
    if (it.type !== "text" || !it.source?.startsWith("field:")) return [it];
    const id = it.source.slice(6);
    if (ids.has(id)) return [it];
    const f = foreign.get(id);
    if (f?.isName) return [{ ...it, source: "slot:name" }];
    const match = f && byLabel.get(f.label.trim().toLowerCase());
    return match ? [{ ...it, source: `field:${match}` }] : [];
  });
  return { ...layout, items };
}

/** id field (sumber `field:<id>`) yang dipakai sebuah layout. */
export function fieldIdsOf(layout: Layout): string[] {
  return layout.items.flatMap((i) => (i.type === "text" && i.source?.startsWith("field:") ? [i.source.slice(6)] : []));
}
