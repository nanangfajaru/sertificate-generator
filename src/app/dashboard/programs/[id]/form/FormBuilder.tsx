"use client";

import { ArrowDown, ArrowUp, Check, ClipboardList, Eye, Plus, Trash2, X } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SetupSteps from "@/components/SetupSteps";
import { useEffect, useMemo, useState, useTransition } from "react";
import CertificateSvg, { type Highlight } from "@/components/CertificateSvg";
import { resolveLayout, type ProgramLike } from "@/lib/certificate/sources";
import type { Layout, QrItem, TextItem } from "@/lib/certificate/types";
import { FIELD_TYPES, type FieldType } from "@/lib/db";
import { saveFields } from "../../../actions";
import type { DesignDTO } from "@/lib/designs";
import TemplatePicker from "./TemplatePicker";

type Row = { id: string; label: string; type: FieldType; required: boolean; options: string; slot: "" | "name" | "extra" };

type Props = {
  programId: string;
  initial: Row[];
  layout: Layout;
  bgUrl: string | null;
  images?: Record<string, string>;
  logoPlaceholder?: boolean;
  custom: boolean;
  templateName: string;
  program: ProgramLike;
  /** langkah terakhir alur pembuatan program baru */
  setup?: boolean;
  /** data popup Ganti sertifikat */
  picker: { isPro: boolean; current: { mode: "template" | "custom"; templateId: string; designId: string | null }; designs: DesignDTO[] };
};

const COLORS = ["#4f46e5", "#d97706", "#059669", "#db2777", "#0891b2", "#7c3aed"];

export default function FormBuilder({ programId, initial, layout, bgUrl, images, logoPlaceholder, custom, templateName, program, setup = false, picker }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [zoom, setZoom] = useState(false);
  const [picking, setPicking] = useState(false);
  const pickerSample = useMemo(() => ({ program: { ...program, mapping: { name: "_n" } }, data: { _n: "Nama Peserta Contoh" }, certNumber: "001/SERT/I/2026", verifyUrl: "https://contoh" }), [program]);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

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
        setup,
      );
      if (!res.error && setup) return router.push(`/dashboard/programs/${programId}?created=1`);
      setMsg(res.error ? { ok: false, text: res.error } : { ok: true, text: "Form tersimpan." });
    });
  }

  return (
    <>
    {/* Wizard: proporsi kolom & posisi penanda langkah sama dengan langkah 1–3 */}
    <div className={`grid gap-6 ${setup ? "items-start lg:grid-cols-3" : "lg:grid-cols-[minmax(0,1fr)_380px]"}`}>
    <div className={`min-w-0 space-y-4 ${setup ? "lg:col-span-2" : ""}`}>
      {setup && <div className="mb-6"><SetupSteps current={3} /></div>}
      <SectionTitle icon={ClipboardList} title="Formulir pendaftaran" hint="Atur pertanyaan untuk peserta. Kolom Di sertifikat menentukan field mana yang dicetak sebagai nama peserta dan keterangan (opsional)." />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.5rem_minmax(0,1fr)_9rem_10rem_4.5rem_5.5rem] items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
          <span>#</span><span>Pertanyaan</span><span>Tipe</span><span>Di sertifikat</span><span className="text-center">Wajib</span><span />
        </div>
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li key={r.id} className="group px-3 py-2.5 hover:bg-slate-50/60">
              <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[1.5rem_minmax(0,1fr)_9rem_10rem_4.5rem_5.5rem]">
                <span className="text-xs font-medium text-slate-400">{i + 1}</span>
                <input
                  className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium outline-none transition hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                  value={r.label}
                  placeholder="Tulis pertanyaan…"
                  onChange={(e) => set(i, { label: e.target.value })}
                  aria-label={`Label field ${i + 1}`}
                />
                <div className="flex items-center justify-end gap-0.5 md:order-last">
                  <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Naik"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Turun"><ArrowDown className="h-4 w-4" /></button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    disabled={r.slot === "name" || rows.length <= 1}
                    title={r.slot === "name" ? "Field nama peserta tidak bisa dihapus" : "Hapus"}
                    aria-label="Hapus"
                    onClick={() => setRows((x) => x.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="col-span-3 flex flex-wrap items-center gap-2 pl-8 md:col-span-1 md:contents md:pl-0">
                  <select className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-500" value={r.type} onChange={(e) => set(i, { type: e.target.value as FieldType })} aria-label="Tipe">
                    {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <select
                    className={`rounded-md border px-2 py-1.5 text-sm outline-none focus:border-brand-500 ${r.slot ? "border-brand-200 bg-brand-50 font-medium text-brand-700" : "border-slate-200 bg-white text-slate-500"}`}
                    value={r.slot}
                    onChange={(e) => setSlot(i, e.target.value as Row["slot"])}
                    aria-label="Tampil di sertifikat"
                  >
                    <option value="">Tidak tampil</option>
                    <option value="name">Nama peserta</option>
                    <option value="extra">Keterangan</option>
                  </select>
                  <label className="flex items-center justify-center gap-1.5 text-sm text-slate-600 md:justify-center" title="Wajib diisi">
                    <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={r.required || r.slot === "name"} disabled={r.slot === "name"} onChange={(e) => set(i, { required: e.target.checked })} />
                    <span className="md:hidden">Wajib</span>
                  </label>
                </div>
              </div>
              {r.type === "select" && (
                <div className="mt-2 pl-8 md:pr-[5.5rem]">
                  <textarea className="input !py-1.5 text-sm" rows={3} value={r.options} placeholder="Pilihan jawaban, satu per baris" onChange={(e) => set(i, { options: e.target.value })} />
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="flex w-full items-center gap-2 border-t border-dashed border-slate-200 px-4 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50/60 disabled:opacity-40"
          disabled={rows.length >= 30}
          onClick={() => setRows((r) => [...r, { id: crypto.randomUUID(), label: "", type: "text", required: false, options: "", slot: "" }])}
        >
          <Plus className="h-4 w-4" /> Tambah pertanyaan
        </button>
      </div>
      {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <div className={setup ? "flex justify-end" : ""}><button className="btn btn-primary" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : setup ? <>Simpan & selesai <Check className="h-4 w-4" /></> : "Simpan form"}</button></div>
    </div>

    <aside className={setup ? "" : "order-first lg:order-last"}>
      <div className="space-y-3 lg:sticky lg:top-20">
        <div className="card !p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
              <p className="truncate text-sm font-semibold">{templateName}</p>
            </div>
            <button type="button" className="btn btn-sm shrink-0" onClick={() => setPicking(true)}>Ganti</button>
          </div>
          <button type="button" className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 text-left" onClick={() => setZoom(true)} aria-label="Perbesar pratinjau sertifikat">
            <CertificateSvg layout={resolved} backgroundUrl={bgUrl} images={images} logoPlaceholder={logoPlaceholder} highlight={highlight} className="block h-auto w-full" />
            <span className="absolute inset-0 grid place-items-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/25 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium shadow"><Eye className="h-4 w-4" /> Perbesar</span>
            </span>
          </button>
          <button type="button" className="btn btn-sm mt-2 w-full" onClick={() => setZoom(true)}><Eye className="h-4 w-4" /> Pratinjau sertifikat</button>
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
    {picking && (
      <TemplatePicker
        programId={programId}
        isPro={picker.isPro}
        sample={pickerSample}
        images={images ?? {}}
        current={picker.current}
        designs={picker.designs}
        onClose={() => setPicking(false)}
        onChanged={(name) => { setPicking(false); setMsg({ ok: true, text: `Sertifikat diganti ke "${name}".` }); }}
      />
    )}
    {zoom && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6" onClick={() => setZoom(false)} role="dialog" aria-modal="true" aria-label="Pratinjau sertifikat">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">Pratinjau sertifikat</p>
              <p className="truncate text-xs text-slate-500">{templateName} · data contoh, nama peserta diganti saat terbit</p>
            </div>
            <button className="btn btn-sm !px-2" onClick={() => setZoom(false)} aria-label="Tutup"><X className="h-4 w-4" /></button>
          </div>
          <div className="bg-slate-100 p-3 sm:p-5">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white shadow-md">
              <CertificateSvg layout={resolved} backgroundUrl={bgUrl} images={images} logoPlaceholder={logoPlaceholder} className="block h-auto w-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
            <a href={`/api/programs/${programId}/sample`} target="_blank" className="btn btn-sm">Contoh PDF</a>
            <button type="button" className="btn btn-sm" onClick={() => { setZoom(false); setPicking(true); }}>Ganti template</button>
            <button className="btn btn-primary btn-sm" onClick={() => setZoom(false)}>Tutup</button>
          </div>
        </div>
      </div>
    )}
    </div>
    </>
  );
}
