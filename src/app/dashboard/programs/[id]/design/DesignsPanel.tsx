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
  programId: string;
  userId: string;
  isPro: boolean;
  designs: DesignDTO[];
  activeId: string | null;
  sample: CertContext;
  fields: { id: string; label: string }[];
  onDesignsChange: (d: DesignDTO[]) => void;
  onActiveChange: (id: string | null) => void;
};

export default function DesignsPanel({ programId, userId, isPro, designs, activeId, sample, fields, onDesignsChange, onActiveChange }: Props) {
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
      {!isPro && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <b>Paket Free:</b> Anda bisa membuat dan menyimpan hingga {DESIGN_LIMITS.free} desain untuk dicoba. <b>Menggunakannya untuk sertifikat khusus paket Pro.</b>
          </p>
          <Link href="/#harga" className="btn btn-sm shrink-0">Lihat paket Pro</Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Unggah desain (PDF halaman pertama, PNG, atau JPG; maks. 10 MB), lalu atur posisi data. <span className="text-slate-400">{designs.length}/{limit} desain</span>
        </p>
        <div>
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button className="btn btn-primary" disabled={busy || full} onClick={() => fileRef.current?.click()} title={full ? "Batas jumlah desain tercapai" : undefined}>
            <ImagePlus className="h-4 w-4" /> {busy ? "Mengunggah…" : "Desain baru"}
          </button>
        </div>
      </div>

      {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}

      {designs.length === 0 ? (
        <div className="card text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-slate-300" />
          <h3 className="mt-2 font-semibold">Belum ada desain</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Unggah desain sertifikat Anda, lalu geser nama, tanggal, nomor, dan QR ke posisi yang diinginkan.</p>
        </div>
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
                      <button className="btn btn-primary btn-sm flex-1" onClick={() => start(async () => { const e = await use(d); setMsg(e ? { ok: false, text: e } : { ok: true, text: `"${d.name}" dipakai untuk sertifikat.` }); })}>Gunakan</button>
                    ) : (
                      <span className="btn btn-sm flex-1 cursor-not-allowed opacity-60" title="Menggunakan desain sendiri khusus paket Pro"><Lock className="h-3.5 w-3.5" /> Pro</span>
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
