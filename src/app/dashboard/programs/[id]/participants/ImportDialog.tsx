"use client";

import { CheckCircle2, ClipboardPaste, Download, FileUp, Upload, X } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { parseDelimited, toCsvLine } from "@/lib/csv";
import { ROLE_COLUMN } from "./role-column";
import { importParticipants, type ImportResult } from "./import-actions";

type Field = { id: string; label: string; type: string; required: boolean; options: string[] };
type Props = { programId: string; fields: Field[]; nameId: string | null; manual: boolean; emailOn: boolean; freeLeft: number | null };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Cocokkan judul kolom ke field form: sama persis, lalu mengandung, lalu sinonim umum. */
function guess(header: string[], f: Field): number {
  const h = header.map(norm);
  const l = norm(f.label);
  let i = h.indexOf(l);
  if (i >= 0) return i;
  i = h.findIndex((x) => x && (x.includes(l) || l.includes(x)));
  if (i >= 0) return i;
  const syn: Record<string, string[]> = { email: ["email", "mail", "surel"], tel: ["hp", "wa", "whatsapp", "telepon", "phone", "nohp"], text: [] };
  const groups = [
    ["peran", "sebagai", "role"],
    ["instansi", "asal", "kantor", "perusahaan", "sekolah", "kampus", "organisasi", "lembaga", "company"],
    ["jabatan", "posisi", "pekerjaan", "profesi", "role"],
    ["kota", "domisili", "alamat", "daerah", "city"],
  ];
  const group = groups.find((g) => g.some((w) => l.includes(w))) ?? [];
  const words = f.type === "email" ? syn.email : f.type === "tel" ? syn.tel : /nama/.test(l) ? ["nama", "name", "namalengkap"] : group;
  return h.findIndex((x) => words.some((w) => x.includes(w)));
}

/** Kolom tambahan di luar formulir: peran (kosong = Peserta). */
const ROLE_FIELD = { id: ROLE_COLUMN, label: "Peran", type: "text", required: false, options: [] as string[] } as const;

export default function ImportDialog(p: Props) {
  const fields = useMemo(() => [...p.fields, ROLE_FIELD], [p.fields]);
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [hasHeader, setHasHeader] = useState(true);
  const [map, setMap] = useState<Record<string, number>>({});
  const [approve, setApprove] = useState(!p.manual);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const table = useMemo(() => (raw.trim() ? parseDelimited(raw) : []), [raw]);
  const header = hasHeader ? table[0] ?? [] : (table[0] ?? []).map((_, i) => `Kolom ${i + 1}`);
  const body = hasHeader ? table.slice(1) : table;

  function load(text: string, name = "") {
    setRaw(text);
    setFileName(name);
    setResult(null);
    const t = text.trim() ? parseDelimited(text) : [];
    const h = t[0] ?? [];
    const m: Record<string, number> = {};
    for (const f of fields) m[f.id] = guess(h, f);
    setMap(m);
    setHasHeader(Object.values(m).some((v) => v >= 0));
  }

  function reset() {
    setRaw(""); setFileName(""); setResult(null); setMap({});
  }

  function template() {
    const csv = "﻿" + toCsvLine(fields.map((f) => f.label)) + "\n" + toCsvLine(fields.map((f) => (f.type === "email" ? "budi@contoh.com" : f.id === p.nameId ? "Budi Santoso" : f.type === "select" ? f.options[0] ?? "" : f.id === ROLE_COLUMN ? "Peserta" : ""))) + "\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "contoh-peserta.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const nameMapped = p.nameId ? (map[p.nameId] ?? -1) >= 0 : true;
  const missingRequired = fields.filter((f) => (f.required || f.id === p.nameId) && (map[f.id] ?? -1) < 0);

  function submit() {
    const rows = body.map((r, i) => ({ line: i + (hasHeader ? 2 : 1), data: Object.fromEntries(fields.map((f) => [f.id, (map[f.id] ?? -1) >= 0 ? r[map[f.id]] ?? "" : ""])) }));
    start(async () => setResult(await importParticipants(p.programId, rows, approve)));
  }

  return (
    <>
      <button type="button" className="btn btn-sm btn-primary" onClick={() => setOpen(true)}><Upload className="h-4 w-4" /> Upload peserta</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Upload peserta">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold">Upload peserta</h2>
                <p className="text-xs text-slate-500">Dari file CSV (Excel / Google Sheets: Simpan sebagai CSV) atau tempel langsung dari spreadsheet.</p>
              </div>
              <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup" onClick={() => { setOpen(false); reset(); }}><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 p-5">
              {result?.imported != null && !result.error ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="text-sm text-emerald-900">
                      <p className="font-semibold">{result.imported} peserta berhasil ditambahkan{result.approved ? " dan sertifikatnya diterbitkan" : " (menunggu persetujuan)"}.</p>
                      {result.approved && p.emailOn && <p className="mt-0.5">Email berisi tautan sertifikat sedang dikirim ke peserta.</p>}
                    </div>
                  </div>
                  {(result.skippedDuplicates || result.skippedLimit || result.invalid?.length) ? (
                    <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      {!!result.skippedDuplicates && <p>{result.skippedDuplicates} baris dilewati karena emailnya sudah terdaftar / ganda.</p>}
                      {!!result.blockedPro && <p className="text-amber-700">{result.blockedPro} peserta tersimpan sebagai menunggu: Pro sudah berakhir dan program memakai template Pro / desain sendiri, sertifikatnya belum bisa diterbitkan.</p>}
                      {!!result.skippedLimit && <p>{result.skippedLimit} baris dilewati karena kuota paket Free (100 peserta per program) penuh.</p>}
                      {!!result.invalid?.length && (
                        <>
                          <p>{result.invalid.length} baris tidak valid:</p>
                          <ul className="ml-4 list-disc text-xs">{result.invalid.map((x) => <li key={x.row}>Baris {x.row}: {x.reason}</li>)}</ul>
                        </>
                      )}
                    </div>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <button className="btn" onClick={reset}>Upload lagi</button>
                    <button className="btn btn-primary" onClick={() => { setOpen(false); reset(); }}>Selesai</button>
                  </div>
                </div>
              ) : !table.length ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-brand-400 hover:bg-brand-50/40">
                      <FileUp className="h-7 w-7 text-brand-600" />
                      <span className="text-sm font-medium">Pilih file CSV</span>
                      <span className="text-xs text-slate-500">Pemisah koma, titik koma, atau tab</span>
                    </button>
                    <label className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
                      <span className="flex items-center gap-1.5 text-sm font-medium"><ClipboardPaste className="h-4 w-4 text-brand-600" /> Atau tempel dari spreadsheet</span>
                      <textarea className="input min-h-[96px] font-mono text-xs" placeholder={"Nama lengkap\tEmail\nBudi Santoso\tbudi@contoh.com"} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (t) { e.preventDefault(); load(t); } }} onChange={(e) => e.target.value.includes("\n") && load(e.target.value)} />
                    </label>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) load(await f.text(), f.name); e.target.value = ""; }} />
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span>Kolom yang dikenali: {fields.map((f) => f.label).join(", ")}. Kolom <b>Peran</b> opsional: kosong = Peserta; isi Pembicara, Narasumber, dll. untuk sertifikat sesuai peran (tidak dihitung kuota).</span>
                    <button type="button" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline" onClick={template}><Download className="h-3.5 w-3.5" /> Unduh file contoh</button>
                  </div>
                  {p.freeLeft != null && <p className="text-xs text-slate-500">Paket Free: sisa kuota {p.freeLeft} peserta untuk program ini.</p>}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p><b>{body.length}</b> baris terbaca{fileName ? ` dari ${fileName}` : ""}.</p>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} /> Baris pertama judul kolom</label>
                      <button className="text-xs text-slate-500 hover:text-slate-800" onClick={reset}>Ganti data</button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200">
                    <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cocokkan kolom</p>
                    <div className="divide-y divide-slate-100">
                      {fields.map((f) => (
                        <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                          <span className="text-sm font-medium">{f.label}{(f.required || f.id === p.nameId) && <span className="text-red-500"> *</span>}</span>
                          <select className="input !w-56 !py-1.5 text-sm" value={map[f.id] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [f.id]: Number(e.target.value) }))}>
                            <option value={-1}>— tidak diisi —</option>
                            {header.map((h, i) => <option key={i} value={i}>{h || `Kolom ${i + 1}`}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500"><tr>{fields.map((f) => <th key={f.id} className="px-3 py-2 font-semibold">{f.label}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {body.slice(0, 5).map((r, i) => (
                          <tr key={i}>{fields.map((f) => <td key={f.id} className="max-w-48 truncate px-3 py-1.5">{(map[f.id] ?? -1) >= 0 ? r[map[f.id]] : <span className="text-slate-300">—</span>}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                    {body.length > 5 && <p className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400">dan {body.length - 5} baris lainnya</p>}
                  </div>

                  <fieldset className="grid gap-2 sm:grid-cols-2">
                    {[
                      [true, "Setujui & terbitkan sertifikat", p.emailOn ? "Peserta langsung dapat sertifikat dan email tautannya." : "Sertifikat langsung terbit (email belum aktif)."],
                      [false, "Masukkan sebagai menunggu", "Setujui nanti dari daftar peserta."],
                    ].map(([v, t, d]) => (
                      <label key={String(v)} className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 ${approve === v ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                        <input type="radio" name="imp-status" className="mt-1" checked={approve === v} onChange={() => setApprove(v as boolean)} />
                        <span><span className="block text-sm font-medium">{t as string}</span><span className="text-xs text-slate-500">{d as string}</span></span>
                      </label>
                    ))}
                  </fieldset>

                  {result?.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{result.error}</p>}
                  {!nameMapped || missingRequired.length ? (
                    <p className="text-sm text-amber-700">Cocokkan dulu kolom wajib: {missingRequired.map((f) => f.label).join(", ")}.</p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <button className="btn" onClick={() => { setOpen(false); reset(); }}>Batal</button>
                    <button className="btn btn-primary" disabled={pending || !body.length || missingRequired.length > 0} onClick={submit}>
                      {pending ? "Mengimpor…" : `Impor ${body.length} peserta`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
