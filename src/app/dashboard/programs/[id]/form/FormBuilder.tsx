"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { FIELD_TYPES, type FieldType } from "@/lib/db";
import { saveFields } from "../../../actions";

type Row = { id: string; label: string; type: FieldType; required: boolean; options: string; slot: "" | "name" | "extra" };

export default function FormBuilder({ programId, initial }: { programId: string; initial: Row[] }) {
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
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-slate-600">
        Atur data yang diisi peserta. Pada kolom <b>Tampil di sertifikat</b>, pilih field mana yang menjadi nama peserta dan (opsional) keterangan tambahan seperti instansi atau peran.
      </p>
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
  );
}
