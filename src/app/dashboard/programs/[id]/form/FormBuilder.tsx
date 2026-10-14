"use client";

import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2 } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import CertificateSvg, { type Highlight } from "@/components/CertificateSvg";
import { resolveLayout, type ProgramLike } from "@/lib/certificate/sources";
import type { Layout, QrItem, TextItem } from "@/lib/certificate/types";
import { FIELD_TYPES, type FieldType } from "@/lib/db";
import { saveFields } from "../../../actions";

type Row = { id: string; label: string; type: FieldType; required: boolean; options: string; slot: "" | "name" | "extra" };

type Props = {
  programId: string;
  initial: Row[];
  layout: Layout;
  bgUrl: string | null;
  custom: boolean;
  templateName: string;
  program: ProgramLike;
};

const COLORS = ["#4f46e5", "#d97706", "#059669", "#db2777", "#0891b2", "#7c3aed"];

export default function FormBuilder({ programId, initial, layout, bgUrl, custom, templateName, program }: Props) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setSlot = (i: number, slot: Row["slot"]) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, slot, required: slot === "name" ? true : x.required } : slot && x.slot === slot ? { ...x, slot: "" } : x)));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  // Kolom formulir yang tampil di sertifikat, mengikuti isian di bawah (langsung berubah saat diedit).
  const nameRow = rows.find((r) => r.slot === "name");
  const extraRow = rows.find((r) => r.slot === "extra");

  const bindings = useMemo(() => {
    const out: { source: string; title: string; field: string | null; color: string; n: string; optional: boolean }[] = [];
    if (!custom) {
      out.push({ source: "slot:name", title: "Nama Peserta", field: nameRow?.label ?? null, color: COLORS[0], n: "1", optional: false });
      out.push({ source: "slot:extra", title: "Keterangan Tambahan", field: extraRow?.label ?? null, color: COLORS[1], n: "2", optional: true });
    } else {
      const seen = new Set<string>();
      for (const it of layout.items) {
        if (it.type !== "text" || !it.source?.startsWith("field:") || seen.has(it.source)) continue;
        seen.add(it.source);
        const row = rows.find((r) => `field:${r.id}` === it.source);
        const i = out.length;
        out.push({ source: it.source, title: row?.slot === "name" ? "Nama Peserta" : (row?.label ?? "Kolom dihapus"), field: row?.label ?? null, color: COLORS[i % COLORS.length], n: String(i + 1), optional: false });
      }
    }
    return out;
  }, [custom, layout, nameRow?.label, extraRow?.label, rows]);

  const resolved = useMemo(() => {
    const data: Record<string, string> = {};
    for (const r of rows) data[r.id] = r.slot === "name" ? "Nama Peserta Contoh" : r.label;
    return resolveLayout(layout, {
      program: { ...program, mapping: { name: nameRow?.id ?? null, extra: extraRow?.id ?? null } },
      data,
      certNumber: "001/SERT/I/2026",
      verifyUrl: "https://contoh",
    });
  }, [layout, program, rows, nameRow?.id, extraRow?.id]);

  const highlight = (item: TextItem | QrItem): Highlight | null => {
    if (item.type !== "text") return null;
    const b = bindings.find((x) => x.source === item.source);
    return b ? { color: b.color, n: b.n } : null;
  };

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveFields(
        programId,
        rows.map((r) => ({ ...r, options: r.options.split("\n").map((s) => s.trim()).filter(Boolean) })),
      );
      setMsg(res.error ? { ok: false, text: res.error } : { ok: true, text: "Form tersimpan." });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
    <div className="min-w-0 space-y-4">
      <SectionTitle icon={ClipboardList} title="Formulir pendaftaran" hint="Atur data yang diisi peserta. Pada kolom Tampil di sertifikat, pilih field untuk nama peserta dan (opsional) keterangan tambahan seperti instansi atau peran." />
      {rows.map((r, i) => (
        <div key={r.id} className="card space-y-3">
          <div className="flex items-start gap-2">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Label</label>
                <input className="input" value={r.label} onChange={(e) => set(i, { label: e.target.value })} />
              </div>
              <div>
                <label className="label">Tipe</label>
                <select className="input" value={r.type} onChange={(e) => set(i, { type: e.target.value as FieldType })}>
                  {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1 pt-6">
              <button type="button" className="btn btn-sm px-2" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naik"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" className="btn btn-sm px-2" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Turun"><ArrowDown className="h-4 w-4" /></button>
            </div>
          </div>
          {r.type === "select" && (
            <div>
              <label className="label">Pilihan (satu per baris)</label>
              <textarea className="input" rows={3} value={r.options} onChange={(e) => set(i, { options: e.target.value })} />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.required || r.slot === "name"} disabled={r.slot === "name"} onChange={(e) => set(i, { required: e.target.checked })} /> Wajib diisi
              </label>
              <label className="flex items-center gap-2 text-sm">
                Tampil di sertifikat:
                <select className="input !w-auto py-1" value={r.slot} onChange={(e) => setSlot(i, e.target.value as Row["slot"])}>
                  <option value="">— tidak —</option>
                  <option value="name">Nama peserta</option>
                  <option value="extra">Keterangan tambahan</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={r.slot === "name" || rows.length <= 1}
              title={r.slot === "name" ? "Field nama peserta tidak bisa dihapus" : undefined}
              onClick={() => setRows((x) => x.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn" disabled={rows.length >= 30} onClick={() => setRows((r) => [...r, { id: crypto.randomUUID(), label: "Field baru", type: "text", required: false, options: "", slot: "" }])}>
        <Plus className="h-4 w-4" /> Tambah field
      </button>
      {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <div><button className="btn btn-primary" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : "Simpan form"}</button></div>
    </div>

    <aside className="order-first lg:order-last">
      <div className="space-y-3 lg:sticky lg:top-4">
        <div className="card !p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
              <p className="truncate text-sm font-semibold">{templateName}</p>
            </div>
            <Link href={`/dashboard/programs/${programId}/design`} className="btn btn-sm shrink-0">Ganti</Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <CertificateSvg layout={resolved} backgroundUrl={bgUrl} highlight={highlight} className="block h-auto w-full" />
          </div>
        </div>

        <div className="card !p-3 text-sm">
          <p className="font-semibold">Kolom yang tampil di sertifikat</p>
          <ul className="mt-2 space-y-2">
            {bindings.length === 0 && <li className="text-slate-500">Belum ada kolom formulir yang dipakai pada desain ini.</li>}
            {bindings.map((b) => (
              <li key={b.source} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: b.color }}>{b.n}</span>
                <span className="min-w-0">
                  <span className="block font-medium">{b.title}</span>
                  <span className={`block truncate ${b.field ? "text-slate-600" : "text-amber-700"}`}>
                    {b.field ? `← ${b.field}` : b.optional ? "Belum dipilih (opsional)" : "Belum dipilih"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
            Kolom lain (mis. email, no. HP) hanya tersimpan pada data peserta dan rekap kehadiran, tidak dicetak di sertifikat.
            {custom && " Atur posisi kolom pada tab Sertifikat → Desain sendiri."}
          </p>
        </div>
      </div>
    </aside>
    </div>
  );
}
