"use client";

import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, Check, Download, Lock, MousePointerClick, Plus, QrCode, Save, Trash2, Type } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import { EVENT_SOURCES, resolveSource, type CertContext } from "@/lib/certificate/sources";
import { FONT_OPTIONS, type Item, type Layout, type QrItem, type TextItem } from "@/lib/certificate/types";
import type { DesignDTO } from "@/lib/designs";
import { saveDesign } from "../../../design-actions";

type Props = {
  design: DesignDTO;
  isPro: boolean;
  isActive: boolean;
  sample: CertContext;
  fields: { id: string; label: string }[];
  onBack: () => void;
  onSaved: (d: DesignDTO) => void;
  /** mengembalikan pesan error, atau null jika berhasil */
  onUse: () => Promise<string | null>;
};

const SAVED_MSG = "Desain tersimpan.";

export default function DesignEditor({ design, isPro, isActive, sample, fields, onBack, onSaved, onUse }: Props) {
  const [name, setName] = useState(design.name);
  const [layout, setLayout] = useState<Layout>(design.layout);
  const [saved, setSaved] = useState(() => JSON.stringify({ n: design.name, l: design.layout }));
  const [selected, setSelected] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const dirty = JSON.stringify({ n: name, l: layout }) !== saved;

  const sources = useMemo(
    () => [...EVENT_SOURCES.map((s) => ({ value: s.value, label: s.label })), ...fields.map((f) => ({ value: `field:${f.id}`, label: `Form: ${f.label}` }))],
    [fields],
  );
  const labelOf = useMemo(() => new Map(sources.map((s) => [s.value, s.label])), [sources]);

  // Pratinjau: parameter yang datanya kosong tetap tampil sebagai "[nama parameter]" agar selalu bisa dipilih & digeser.
  const preview = useMemo<Layout>(
    () => ({
      ...layout,
      items: layout.items.map((it): Item => {
        if (it.type === "qr") return { ...it, url: sample.verifyUrl };
        if (it.type !== "text") return it;
        let text = it.source ? resolveSource(it.source, sample) : (it.text ?? "");
        const empty = !text;
        if (empty) text = it.source ? `[${labelOf.get(it.source) ?? "kosong"}]` : "[Teks kosong]";
        else if (it.upper) text = text.toUpperCase();
        return { ...it, text: `${empty ? "" : (it.prefix ?? "")}${text}`, opacity: empty ? 0.45 : it.opacity };
      }),
    }),
    [layout, sample, labelOf],
  );

  const current = layout.items.find((i) => i.id === selected) as TextItem | QrItem | undefined;
  const numberOf = (id?: string) => layout.items.findIndex((i) => i.id === id) + 1;
  const highlight = showBadges ? (it: TextItem | QrItem) => ({ color: it.id === selected ? "#4f46e5" : "#64748b", n: String(numberOf(it.id)) }) : undefined;

  const rowLabel = (it: Item) => (it.type === "qr" ? "Kode QR verifikasi" : it.type === "text" ? (it.source ? (labelOf.get(it.source) ?? it.source) : "Teks tetap") : "");
  const rowValue = (it: Item) => {
    if (it.type === "qr") return `${Math.round(it.size)} px`;
    if (it.type !== "text") return "";
    const v = it.source ? resolveSource(it.source, sample) : (it.text ?? "");
    return v || "kosong pada contoh ini";
  };

  const patch = (id: string, p: Partial<TextItem> & Partial<QrItem>) =>
    setLayout((l) => ({ ...l, items: l.items.map((i) => (i.id === id ? ({ ...i, ...p } as Item) : i)) }));
  const remove = (id?: string) => {
    setLayout((l) => ({ ...l, items: l.items.filter((x) => x.id !== id) }));
    if (selected === id) setSelected(null);
  };

  const usedSources = new Set(layout.items.flatMap((i) => (i.type === "text" && i.source ? [i.source] : [])));
  const unused = sources.filter((s) => !usedSources.has(s.value));
  const hasQr = layout.items.some((i) => i.type === "qr");

  /** Posisi Y pertama yang belum ditempati elemen lain, agar elemen baru tidak menumpuk. */
  function freeY() {
    const taken = layout.items.flatMap((i) => (i.type === "text" || i.type === "qr" ? [i.y] : []));
    for (let y = Math.round(layout.height * 0.2); y < layout.height - 30; y += 34) if (taken.every((t) => Math.abs(t - y) >= 30)) return y;
    return Math.round(layout.height / 2);
  }
  function add(item: Item) {
    setLayout((l) => ({ ...l, items: [...l.items, item] }));
    setSelected(item.id ?? null);
  }
  const uid = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;
  const addSource = (source: string) => {
    const small = /signer|cert_number|date|location/.test(source);
    add({ type: "text", id: uid("t"), x: 500, y: freeY(), size: small ? 18 : 28, font: "sans", color: "#1f2937", align: "center", source, maxWidth: 800 });
  };
  const addStatic = () => add({ type: "text", id: uid("t"), x: 500, y: freeY(), size: 24, font: "sans", color: "#1f2937", align: "center", text: "Teks tetap", maxWidth: 800 });
  const addQr = () => add({ type: "qr", id: uid("q"), x: 880, y: layout.height - 120, size: 80, color: "#111827" });

  function doSave(after?: () => void) {
    setMsg(null);
    start(async () => {
      const r = await saveDesign(design.id, { name, layout });
      if (r.error) return setMsg({ ok: false, text: r.error });
      setSaved(JSON.stringify({ n: name, l: layout }));
      onSaved({ ...design, name: name.trim(), layout, updatedAt: r.updatedAt ?? design.updatedAt });
      setMsg({ ok: true, text: SAVED_MSG });
      after?.();
    });
  }

  function useIt() {
    const run = async () => {
      const err = await onUse();
      setMsg(err ? { ok: false, text: err } : { ok: true, text: "Desain ini sekarang dipakai untuk sertifikat." });
    };
    if (dirty) doSave(() => void run());
    else start(run);
  }

  const back = () => {
    if (dirty && !confirm("Perubahan belum disimpan. Tetap kembali ke daftar desain?")) return;
    onBack();
  };

  const sectionTitle = "mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400";
  const side = "order-2 space-y-3 lg:order-3 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pr-0.5";

  return (
    <div className="space-y-4">
      {/* Bar aksi desain */}
      <div className="card flex flex-wrap items-center gap-3 !p-3">
        <button className="btn btn-sm" onClick={back}><ArrowLeft className="h-4 w-4" /> Semua desain</button>
        <input className="input !w-56 !py-1.5 font-medium" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Nama desain" />
        {dirty && <span className="text-xs font-medium text-amber-600">● Belum disimpan</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isPro && <a href={`/api/designs/${design.id}/sample`} target="_blank" className="btn btn-sm"><Download className="h-4 w-4" /> Contoh PDF</a>}
          <button className="btn btn-sm" disabled={pending || !dirty} onClick={() => doSave()}><Save className="h-4 w-4" /> {pending ? "Menyimpan…" : "Simpan"}</button>
          {isActive ? (
            <span className="btn btn-sm cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"><Check className="h-4 w-4" /> Dipakai untuk sertifikat</span>
          ) : isPro ? (
            <button className="btn btn-primary btn-sm" disabled={pending} onClick={useIt}>Gunakan untuk sertifikat</button>
          ) : (
            <Link href="/#harga" className="btn btn-sm" title="Menggunakan desain sendiri khusus paket Pro"><Lock className="h-3.5 w-3.5" /> Gunakan (Pro)</Link>
          )}
        </div>
      </div>
      {msg && <p className={`rounded-lg p-2.5 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:items-start">
        {/* Kiri: elemen aktif + tambah */}
        <aside className="order-3 space-y-3 lg:order-1 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)] lg:overflow-y-auto lg:pr-0.5">
          <div className="card !p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Elemen aktif ({layout.items.length})</p>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500"><input type="checkbox" checked={showBadges} onChange={(e) => setShowBadges(e.target.checked)} /> Nomor</label>
            </div>
            {layout.items.length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada elemen. Tambahkan di bawah.</p>
            ) : (
              <ul className="space-y-1">
                {layout.items.map((it, i) => {
                  const active = it.id === selected;
                  return (
                    <li key={it.id ?? i} className={`flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5 ${active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setSelected(it.id ?? null)}>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${active ? "bg-brand-600" : "bg-slate-500"}`}>{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium">{rowLabel(it)}</span>
                          <span className="block truncate text-[11px] text-slate-500">{rowValue(it)}</span>
                        </span>
                      </button>
                      <button type="button" className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Hapus elemen" onClick={() => remove(it.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card !p-3">
            <p className={sectionTitle}>Tambah elemen</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100" onClick={addStatic}><Type className="mr-1 inline h-3 w-3" />Teks tetap</button>
              {!hasQr && <button type="button" className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100" onClick={addQr}><QrCode className="mr-1 inline h-3 w-3" />Kode QR</button>}
            </div>
            <p className={`${sectionTitle} mt-3`}>Parameter data</p>
            <div className="flex flex-wrap gap-1.5">
              {unused.map((u) => <button key={u.value} type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-500 hover:bg-brand-50" onClick={() => addSource(u.value)}><Plus className="mr-0.5 inline h-3 w-3" />{u.label}</button>)}
              {unused.length === 0 && <span className="text-xs text-slate-400">Semua parameter sudah dipakai.</span>}
            </div>
          </div>
        </aside>

        {/* Tengah: kanvas */}
        <div className="order-1 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white lg:order-2">
          <CertificateSvg layout={preview} backgroundUrl={design.previewUrl} highlight={highlight} className="block h-auto w-full" selectedId={selected} onSelect={setSelected} onMove={(id, x, y) => patch(id, { x, y })} />
        </div>

        {/* Kanan: properti elemen terpilih */}
        <aside className={side}>
          <div className="card !p-3">
            {!current ? (
              <div className="py-6 text-center text-sm text-slate-500">
                <MousePointerClick className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                Pilih elemen dari daftar di kiri, atau klik langsung pada desain, untuk mengubah propertinya.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold"><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">{numberOf(current.id)}</span>{rowLabel(current)}</p>
                  <button className="btn btn-danger btn-sm shrink-0 !px-2" onClick={() => remove(current.id)} aria-label="Hapus elemen"><Trash2 className="h-4 w-4" /></button>
                </div>

                {current.type === "text" && (
                  <>
                    <section>
                      <p className={sectionTitle}>Isi</p>
                      <select className="input" value={current.source ?? ""} onChange={(e) => patch(current.id!, e.target.value ? { source: e.target.value, text: undefined } : { source: undefined, text: current.text || "Teks tetap" })}>
                        <option value="">Teks tetap (ketik sendiri)</option>
                        {sources.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      {!current.source && <input className="input mt-2" maxLength={200} value={current.text ?? ""} onChange={(e) => patch(current.id!, { text: e.target.value })} placeholder="Tulis teks…" />}
                      <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!current.upper} onChange={(e) => patch(current.id!, { upper: e.target.checked })} /> HURUF KAPITAL</label>
                    </section>

                    <section>
                      <p className={sectionTitle}>Tampilan</p>
                      <select className="input" value={current.font} onChange={(e) => patch(current.id!, { font: e.target.value as TextItem["font"] })}>
                        {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <div className="mt-2 grid grid-cols-[1fr_72px] gap-2">
                        <div>
                          <label className="label !text-xs">Ukuran ({current.size}px)</label>
                          <input type="range" min={8} max={160} className="w-full" value={current.size} onChange={(e) => patch(current.id!, { size: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="label !text-xs">Warna</label>
                          <input type="color" className="input h-[38px] !p-1" value={current.color} onChange={(e) => patch(current.id!, { color: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-2 inline-flex w-full overflow-hidden rounded-lg border border-slate-300" role="group" aria-label="Rata teks">
                        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([v, Icon]) => (
                          <button key={v} type="button" aria-pressed={current.align === v} className={`flex flex-1 items-center justify-center py-1.5 ${current.align === v ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`} onClick={() => patch(current.id!, { align: v })}><Icon className="h-4 w-4" /></button>
                        ))}
                      </div>
                      <label className="label mt-2 !text-xs">Lebar maks. ({current.maxWidth ?? "bebas"})</label>
                      <input type="range" min={100} max={1000} step={10} className="w-full" value={current.maxWidth ?? 1000} onChange={(e) => patch(current.id!, { maxWidth: Number(e.target.value) })} />
                      <p className="hint">Teks yang lebih panjang otomatis diperkecil.</p>
                    </section>
                  </>
                )}

                {current.type === "qr" && (
                  <section>
                    <p className={sectionTitle}>Ukuran</p>
                    <label className="label !text-xs">QR ({Math.round(current.size)}px)</label>
                    <input type="range" min={40} max={200} className="w-full" value={current.size} onChange={(e) => patch(current.id!, { size: Number(e.target.value) })} />
                  </section>
                )}

                <section>
                  <p className={sectionTitle}>Posisi</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label !text-xs">X</label><input type="number" className="input" value={current.x} onChange={(e) => patch(current.id!, { x: Number(e.target.value) || 0 })} /></div>
                    <div><label className="label !text-xs">Y</label><input type="number" className="input" value={current.y} onChange={(e) => patch(current.id!, { y: Number(e.target.value) || 0 })} /></div>
                  </div>
                  <p className="hint">Atau seret elemen langsung pada desain.</p>
                </section>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
