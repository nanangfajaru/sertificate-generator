import type { ProgramField } from "./db";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tanggal: terima YYYY-MM-DD atau DD/MM/YYYY (format umum Excel Indonesia). */
export function normDate(v: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}

/**
 * Validasi & rapikan isian peserta sesuai field form (dipakai impor CSV dan edit oleh panitia).
 * Mengembalikan data bersih (hanya field yang terisi) atau pesan kesalahan pertama.
 */
export function cleanParticipantData(fields: ProgramField[], nameId: string | null | undefined, raw: Record<string, unknown>): { data: Record<string, string> } | { error: string } {
  const data: Record<string, string> = {};
  for (const field of fields) {
    let v = String(raw?.[field.id] ?? "").trim();
    if (!v) {
      if (field.required || field.id === nameId) return { error: `"${field.label}" kosong` };
      continue;
    }
    if (v.length > (field.type === "textarea" ? 2000 : 300)) return { error: `"${field.label}" terlalu panjang` };
    if (field.type === "email" && !EMAIL.test(v)) return { error: `Email "${v}" tidak valid` };
    if (field.type === "number" && !Number.isFinite(Number(v.replace(",", ".")))) return { error: `"${field.label}" harus angka` };
    if (field.type === "date") {
      const d = normDate(v);
      if (!d) return { error: `"${field.label}" bukan tanggal (pakai YYYY-MM-DD atau DD/MM/YYYY)` };
      v = d;
    }
    if (field.type === "select") {
      const opt = (field.options ?? []).find((o) => o.toLowerCase() === v.toLowerCase());
      if (!opt) return { error: `"${v}" bukan pilihan "${field.label}"` };
      v = opt;
    }
    data[field.id] = v;
  }
  return { data };
}
