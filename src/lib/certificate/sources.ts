import type { Item, Layout, TextItem } from "./types";

export type ProgramLike = {
  org_name: string;
  name: string;
  cert_type: string;
  description: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  signer1_name: string | null;
  signer1_title: string | null;
  signer2_name: string | null;
  signer2_title: string | null;
  mapping: Record<string, string | null> | null;
};

export type CertContext = {
  program: ProgramLike;
  /** nilai isian peserta: id field -> nilai */
  data: Record<string, string>;
  certNumber?: string | null;
  verifyUrl: string;
};

export const EVENT_SOURCES: { value: string; label: string }[] = [
  { value: "event:org_name", label: "Nama instansi" },
  { value: "event:event_name", label: "Nama kegiatan" },
  { value: "event:cert_type", label: "Jenis sertifikat" },
  { value: "event:description", label: "Kalimat deskripsi" },
  { value: "event:date", label: "Tanggal kegiatan" },
  { value: "event:location", label: "Lokasi" },
  { value: "event:date_location", label: "Lokasi, tanggal" },
  { value: "event:cert_number", label: "Nomor sertifikat" },
  { value: "event:signer1_name", label: "Penandatangan 1 – nama" },
  { value: "event:signer1_title", label: "Penandatangan 1 – jabatan" },
  { value: "event:signer2_name", label: "Penandatangan 2 – nama" },
  { value: "event:signer2_title", label: "Penandatangan 2 – jabatan" },
];

/** Slot peserta yang dipakai template bawaan. `name` wajib dipetakan. */
export const SLOTS: { key: string; label: string; required: boolean }[] = [
  { key: "name", label: "Nama peserta", required: true },
  { key: "extra", label: "Keterangan tambahan (mis. instansi / peran)", required: false },
];

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function parseDate(s: string) {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

export function formatDateRange(start: string, end?: string | null): string {
  const a = parseDate(start);
  if (!end || end === start) return `${a.d} ${BULAN[a.m - 1]} ${a.y}`;
  const b = parseDate(end);
  if (a.y === b.y && a.m === b.m) return `${a.d} – ${b.d} ${BULAN[a.m - 1]} ${a.y}`;
  if (a.y === b.y) return `${a.d} ${BULAN[a.m - 1]} – ${b.d} ${BULAN[b.m - 1]} ${a.y}`;
  return `${a.d} ${BULAN[a.m - 1]} ${a.y} – ${b.d} ${BULAN[b.m - 1]} ${b.y}`;
}

export function resolveSource(source: string, ctx: CertContext): string {
  const p = ctx.program;
  if (source.startsWith("event:")) {
    switch (source.slice(6)) {
      case "org_name": return p.org_name;
      case "event_name": return p.name;
      case "cert_type": return p.cert_type;
      case "description": return p.description;
      case "date": return formatDateRange(p.start_date, p.end_date);
      case "location": return p.location ?? "";
      case "date_location": {
        const d = formatDateRange(p.start_date, p.end_date);
        return p.location ? `${p.location}, ${d}` : d;
      }
      case "cert_number": return ctx.certNumber ?? "";
      case "signer1_name": return p.signer1_name ?? "";
      case "signer1_title": return p.signer1_title ?? "";
      case "signer2_name": return p.signer2_name ?? "";
      case "signer2_title": return p.signer2_title ?? "";
    }
    return "";
  }
  if (source.startsWith("slot:")) {
    const fieldId = p.mapping?.[source.slice(5)];
    return fieldId ? (ctx.data[fieldId] ?? "").trim() : "";
  }
  if (source.startsWith("field:")) return (ctx.data[source.slice(6)] ?? "").trim();
  return "";
}

/** Mengisi `text` pada tiap item berdasarkan `source`; item kosong / showIf kosong dibuang. */
export function resolveLayout(layout: Layout, ctx: CertContext): Layout {
  const items: Item[] = [];
  for (const it of layout.items) {
    if (it.showIf && !resolveSource(it.showIf, ctx)) continue;
    if (it.type === "qr") {
      items.push({ ...it, url: ctx.verifyUrl });
    } else if (it.type === "text") {
      let text = it.source ? resolveSource(it.source, ctx) : (it.text ?? "");
      if (!text) continue;
      if (it.upper) text = text.toUpperCase();
      items.push({ ...it, text: `${it.prefix ?? ""}${text}` } as TextItem);
    } else {
      items.push(it);
    }
  }
  return { ...layout, items };
}
