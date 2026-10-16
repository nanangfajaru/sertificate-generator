"use client";

import { Check, ImagePlus, Lock, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { CertContext } from "@/lib/certificate/sources";
import { DESIGN_LIMITS, type DesignDTO } from "@/lib/designs";
import { createDesign, deleteDesign, useDesign } from "../../../design-actions";
import DesignEditor from "./DesignEditor";
import { MAX_DESIGN_BYTES, readDesign, uploadDesignFiles } from "./design-upload";

type Props = {
  logoUrl: string | null;
  programId: string;
  userId: string;
  isPro: boolean;
  /** admin melihat program milik pengguna lain: tidak boleh mengubah */
  readOnly?: boolean;
  designs: DesignDTO[];
  activeId: string | null;
  sample: CertContext;
  fields: { id: string; label: string }[];
  onDesignsChange: (d: DesignDTO[]) => void;
  onActiveChange: (id: string | null) => void;
};

export default function DesignsPanel({ programId, userId, isPro, readOnly, designs, activeId, sample, fields, logoUrl, onDesignsChange, onActiveChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const limit = isPro ? DESIGN_LIMITS.pro : DESIGN_LIMITS.free;
  const full = designs.length >= limit;
  const editing = designs.find((d) => d.id === editingId) ?? null;

  async function onFile(file: File) {
    setMsg(null);
    if (readOnly) return setMsg({ ok: false, text: "Program ini milik pengguna lain. Sebagai admin Anda hanya bisa melihat; unggah desain harus dilakukan pemilik program." });
    if (file.size > MAX_DESIGN_BYTES) return setMsg({ ok: false, text: "Ukuran file maksimal 10 MB" });
    setBusy(true);
    try {
      const d = await readDesign(file);
      const meta = await uploadDesignFiles(userId, programId, file, d);
      const r = await createDesign(programId, { ...meta, name: file.name.replace(/\.[^.]+$/, "").slice(0, 60) });
      if (r.error || !r.design) throw new Error(r.error ?? "Gagal menyimpan desain");
      onDesignsChange([...designs, r.design]);
      setEditingId(r.design.id);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal mengunggah" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function use(d: DesignDTO): Promise<string | null> {
    const r = await useDesign(programId, d.id);
    if (r.error) return r.error;
    onActiveChange(d.id);
    return null;
  }

  function remove(d: DesignDTO) {
    const active = d.id === activeId;
    if (!confirm(`Hapus desain "${d.name}"?${active ? "\n\nDesain ini sedang dipakai; sertifikat akan kembali memakai template." : ""}`)) return;
    start(async () => {
      const r = await deleteDesign(d.id);
      if (r.error) return setMsg({ ok: false, text: r.error });
      if (active) onActiveChange(null);
      onDesignsChange(designs.filter((x) => x.id !== d.id));
      if (editingId === d.id) setEditingId(null);
      setMsg({ ok: true, text: "Desain dihapus." });
    });
  }

  if (editing) {
    return (
      <DesignEditor
        logoUrl={logoUrl}
        key={editing.id}
        design={editing}
        isPro={isPro}
        isActive={editing.id === activeId}
        sample={sample}
        fields={fields}
        onBack={() => setEditingId(null)}
        onSaved={(d) => onDesignsChange(designs.map((x) => (x.id === d.id ? { ...x, name: d.name, layout: d.layout, updatedAt: d.updatedAt } : x)))}
        onUse={() => use(editing)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-4 !p-4">
        <div className="min-w-[14rem] flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Desain sendiri</span>
            <span className="font-medium text-slate-600">{designs.length} / {limit}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${full ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${Math.min(100, (designs.length / limit) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Unggah PDF (halaman pertama), PNG, atau JPG hingga 10 MB, lalu geser nama, tanggal, nomor, dan QR ke posisi yang diinginkan.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button className="btn btn-primary" disabled={busy || full} onClick={() => fileRef.current?.click()} title={full ? "Batas jumlah desain tercapai" : undefined}>
            <ImagePlus className="h-4 w-4" /> {busy ? "Mengunggah…" : "Desain baru"}
          </button>
        </div>
      </div>

      {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}

      {designs.length === 0 ? (
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-4 py-12 text-center transition hover:border-brand-500 hover:bg-brand-50">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm"><ImagePlus className="h-7 w-7" /></span>
          <span className="mt-3 font-semibold">Unggah desain pertama Anda</span>
          <span className="mt-1 text-sm text-slate-600">Klik di sini untuk memilih file PDF, PNG, atau JPG</span>
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => {
            const active = d.id === activeId;
            return (
              <div key={d.id} className={`overflow-hidden rounded-xl border bg-white ${active ? "border-brand-600 ring-2 ring-brand-100" : "border-slate-200"}`}>
                <button type="button" className="block aspect-[4/3] w-full bg-slate-50" onClick={() => setEditingId(d.id)} aria-label={`Edit ${d.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {d.previewUrl ? <img src={d.previewUrl} alt={d.name} className="h-full w-full object-contain" /> : <span className="text-xs text-slate-400">Tanpa pratinjau</span>}
                </button>
                <div className="space-y-2 border-t border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">{d.name}</p>
                    <span className="badge shrink-0 uppercase">{d.kind}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm flex-1" onClick={() => setEditingId(d.id)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    {active ? (
                      <span className="btn btn-sm flex-1 cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"><Check className="h-3.5 w-3.5" /> Dipakai</span>
                    ) : isPro ? (
                      <button className="btn btn-primary btn-sm flex-1" onClick={() => start(async () => { const e = await use(d); setMsg(e ? { ok: false, text: e } : { ok: true, text: `"${d.name}" dipakai untuk sertifikat.` }); })}>Gunakan untuk template</button>
                    ) : (
                      <Link href="/dashboard/upgrade" className="btn btn-sm flex-1" title="Menggunakan desain sendiri khusus paket Pro"><Lock className="h-3.5 w-3.5" /> Gunakan untuk template</Link>
                    )}
                    <button className="btn btn-danger btn-sm !px-2" onClick={() => remove(d)} aria-label={`Hapus ${d.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
