"use client";

import { Plus, QrCode, Trash2, Type, Upload } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import { createClient } from "@/lib/supabase/client";
import { EVENT_SOURCES, resolveSource, type CertContext } from "@/lib/certificate/sources";
import { FONT_OPTIONS, type Item, type Layout, type QrItem, type TextItem } from "@/lib/certificate/types";
import { registerDesign, saveDesignLayout } from "../../../actions";

type Props = {
  programId: string;
  userId: string;
  designLayout: Layout | null;
  designBgUrl: string | null;
  sample: CertContext;
  fields: { id: string; label: string }[];
};

const MAX_BYTES = 10 * 1024 * 1024;

async function readDesign(file: File): Promise<{ kind: "pdf" | "png" | "jpg"; preview: Blob; width: number; height: number }> {
  if (file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(3, 2000 / base.width);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
    const preview = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("canvas"))), "image/png"));
    return { kind: "pdf", preview, width: base.width, height: base.height };
  }
  if (file.type === "image/png" || file.type === "image/jpeg") {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("img"));
      i.src = url;
    });
    URL.revokeObjectURL(url);
    return { kind: file.type === "image/png" ? "png" : "jpg", preview: file, width: img.naturalWidth, height: img.naturalHeight };
  }
  throw new Error("Format harus PDF, PNG, atau JPG");
}

export default function DesignEditor({ programId, userId, designLayout, designBgUrl, sample, fields }: Props) {
  const [layout, setLayout] = useState<Layout | null>(designLayout);
  const [bg, setBg] = useState<string | null>(designBgUrl);
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const sources = useMemo(
    () => [
      ...EVENT_SOURCES.map((s) => ({ value: s.value, label: s.label })),
      ...fields.map((f) => ({ value: `field:${f.id}`, label: `Form: ${f.label}` })),
    ],
    [fields],
  );
  const labelOf = useMemo(() => new Map(sources.map((s) => [s.value, s.label])), [sources]);

  // Pratinjau editor: parameter yang datanya kosong (mis. penandatangan ke-2) tetap tampil sebagai
  // "[nama parameter]" agar selalu bisa dilihat, dipilih, dan digeser.
  const preview = useMemo(() => {
    if (!layout) return null;
    return {
      ...layout,
      items: layout.items.map((it): Item => {
        if (it.type === "qr") return { ...it, url: sample.verifyUrl };
        if (it.type !== "text") return it;
        let text = it.source ? resolveSource(it.source, sample) : (it.text ?? "");
        const empty = !text;
        if (empty) text = `[${(it.source && labelOf.get(it.source)) || "kosong"}]`;
        else if (it.upper) text = text.toUpperCase();
        return { ...it, text: `${empty ? "" : (it.prefix ?? "")}${text}`, opacity: empty ? 0.45 : it.opacity };
      }),
    };
  }, [layout, sample, labelOf]);

  const current = layout?.items.find((i) => i.id === selected) as Item | undefined;
  const [showBadges, setShowBadges] = useState(true);

  const patch = (id: string, p: Partial<TextItem>) =>
    setLayout((l) => l && { ...l, items: l.items.map((i) => (i.id === id ? ({ ...i, ...p } as Item) : i)) });
  const patchPos = (id: string, p: { x?: number; y?: number }) =>
    setLayout((l) => l && { ...l, items: l.items.map((i) => (i.id === id ? ({ ...i, ...p } as Item) : i)) });

  const numberOf = (id?: string) => (layout ? layout.items.findIndex((i) => i.id === id) + 1 : 0);
  const highlight = showBadges
    ? (it: TextItem | QrItem) => ({ color: it.id === selected ? "#4f46e5" : "#64748b", n: String(numberOf(it.id)) })
    : undefined;

  const rowLabel = (it: Item) => (it.type === "qr" ? "Kode QR verifikasi" : it.type === "text" ? (it.source ? (labelOf.get(it.source) ?? it.source) : `Teks: ${it.text ?? ""}`) : "");
  const rowValue = (it: Item) => {
    if (it.type !== "text") return it.type === "qr" ? `${Math.round(it.size)} px` : "";
    const v = it.source ? resolveSource(it.source, sample) : (it.text ?? "");
    return v || "kosong pada contoh ini";
  };
  const usedSources = new Set((layout?.items ?? []).flatMap((i) => (i.type === "text" && i.source ? [i.source] : [])));
  const unused = sources.filter((s) => !usedSources.has(s.value));
  const hasQr = !!layout?.items.some((i) => i.type === "qr");

  /** Posisi Y pertama yang belum ditempati elemen lain, agar elemen baru tidak menumpuk. */
  function freeY(l: Layout) {
    const taken = l.items.flatMap((i) => (i.type === "text" || i.type === "qr" ? [i.y] : []));
    for (let y = Math.round(l.height * 0.2); y < l.height - 30; y += 34) {
      if (taken.every((t) => Math.abs(t - y) >= 30)) return y;
    }
    return Math.round(l.height / 2);
  }

  function addSource(source: string) {
    if (!layout) return;
    const id = `t-${crypto.randomUUID().slice(0, 8)}`;
    const small = source.includes("signer") || source === "event:cert_number" || source === "event:date_location" || source === "event:date" || source === "event:location";
    const item: TextItem = {
      type: "text",
      id,
      x: 500,
      y: freeY(layout),
      size: small ? 18 : 28,
      font: "sans",
      color: "#1f2937",
      align: "center",
      source,
      maxWidth: 800,
    };
    setLayout({ ...layout, items: [...layout.items, item] });
    setSelected(id);
  }

  async function onFile(file: File) {
    setMsg(null);
    if (file.size > MAX_BYTES) return setMsg({ ok: false, text: "Ukuran file maksimal 10 MB" });
    setBusy(true);
    try {
      const d = await readDesign(file);
      const sb = createClient();
      const base = `${userId}/${programId}/${crypto.randomUUID()}`;
      const path = `${base}.${d.kind}`;
      const previewPath = `${base}-preview.${d.kind === "jpg" ? "jpg" : "png"}`;
      const up1 = await sb.storage.from("designs").upload(path, file, { contentType: file.type });
      if (up1.error) throw new Error(up1.error.message);
      const up2 = await sb.storage.from("designs").upload(previewPath, d.preview, { contentType: d.kind === "jpg" ? "image/jpeg" : "image/png" });
      if (up2.error) throw new Error(up2.error.message);
      const r = await registerDesign(programId, { path, previewPath, kind: d.kind, width: d.width, height: d.height });
      if (r.error) throw new Error(r.error);
      // Muat ulang agar layout default & URL pratinjau bertanda tangan dari server.
      window.location.reload();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal mengunggah" });
      setBusy(false);
    }
  }

  function addText() {
    if (!layout) return;
    const id = `t-${crypto.randomUUID().slice(0, 8)}`;
    const item: TextItem = { type: "text", id, x: 500, y: freeY(layout), size: 24, font: "sans", color: "#1f2937", align: "center", source: "event:org_name", maxWidth: 800 };
    setLayout({ ...layout, items: [...layout.items, item] });
    setSelected(id);
  }

  function save() {
    if (!layout) return;
    setMsg(null);
    start(async () => {
      const r = await saveDesignLayout(programId, layout);
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Tersimpan. Desain ini dipakai untuk sertifikat." });
    });
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">Upload desain (PDF halaman pertama, PNG, atau JPG; maks. 10 MB). Teks bisa digeser langsung pada pratinjau.</div>
        <div>
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button className="btn btn-primary" disabled={busy} onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> {busy ? "Mengunggah…" : layout ? "Ganti desain" : "Upload desain"}</button>
        </div>
      </div>

      {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}

      {layout && preview && (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <CertificateSvg layout={preview} backgroundUrl={bg} highlight={highlight} className="block h-auto w-full" selectedId={selected} onSelect={setSelected} onMove={(id, x, y) => patch(id, { x, y } as Partial<TextItem>)} />
          </div>

          <div className="space-y-3">
            <div className="card !p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Elemen aktif ({layout.items.length})</p>
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                  <input type="checkbox" checked={showBadges} onChange={(e) => setShowBadges(e.target.checked)} /> Nomor di desain
                </label>
              </div>
              {layout.items.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada elemen. Tambahkan parameter di bawah.</p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-y-auto pr-0.5">
                  {layout.items.map((it, i) => {
                    const active = it.id === selected;
                    return (
                      <li key={it.id ?? i} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}>
                        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setSelected(it.id ?? null)}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${active ? "bg-brand-600" : "bg-slate-500"}`}>{i + 1}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{rowLabel(it)}</span>
                            <span className="block truncate text-xs text-slate-500">{rowValue(it)}</span>
                          </span>
                        </button>
                        {it.type === "text" && <span className="shrink-0 text-[11px] text-slate-400">{it.size}px</span>}
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Hapus elemen"
                          onClick={() => {
                            setLayout({ ...layout, items: layout.items.filter((x) => x.id !== it.id) });
                            if (active) setSelected(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-1.5 text-xs font-medium text-slate-600">Tambahkan parameter</p>
                <div className="flex flex-wrap gap-1.5">
                  {unused.map((u) => (
                    <button key={u.value} type="button" className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-500 hover:bg-brand-50" onClick={() => addSource(u.value)}>
                      + {u.label}
                    </button>
                  ))}
                  {!hasQr && (
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-500 hover:bg-brand-50"
                      onClick={() => {
                        const id = `q-${crypto.randomUUID().slice(0, 8)}`;
                        setLayout({ ...layout, items: [...layout.items, { type: "qr", id, x: 880, y: layout.height - 120, size: 80, color: "#111827" }] });
                        setSelected(id);
                      }}
                    >
                      + Kode QR
                    </button>
                  )}
                  {unused.length === 0 && hasQr && <span className="text-xs text-slate-400">Semua parameter sudah dipakai.</span>}
                </div>
              </div>
            </div>

            <div className="card space-y-3">
              <div className="flex gap-2">
                <button className="btn btn-sm" onClick={addText} title="Tambah elemen teks lagi. Parameter yang sama boleh dipakai lebih dari sekali."><Type className="h-4 w-4" /> Teks baru</button>
              </div>

              {current ? (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  {current.type === "text" && (
                    <>
                      <div>
                        <label className="label">Isi dari</label>
                        <select className="input" value={current.source ?? ""} onChange={(e) => patch(current.id!, { source: e.target.value })}>
                          {sources.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label">Posisi X</label>
                          <input type="number" className="input" value={current.x} onChange={(e) => patchPos(current.id!, { x: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <label className="label">Posisi Y</label>
                          <input type="number" className="input" value={current.y} onChange={(e) => patchPos(current.id!, { y: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <label className="label">Font</label>
                          <select className="input" value={current.font} onChange={(e) => patch(current.id!, { font: e.target.value as TextItem["font"] })}>
                            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">Rata</label>
                          <select className="input" value={current.align} onChange={(e) => patch(current.id!, { align: e.target.value as TextItem["align"] })}>
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Ukuran</label>
                          <input type="number" className="input" min={6} max={200} value={current.size} onChange={(e) => patch(current.id!, { size: Number(e.target.value) || 24 })} />
                        </div>
                        <div>
                          <label className="label">Warna</label>
                          <input type="color" className="input h-[38px] p-1" value={current.color} onChange={(e) => patch(current.id!, { color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="label">Lebar maks. ({current.maxWidth ?? "bebas"})</label>
                        <input type="range" min={100} max={1000} step={10} className="w-full" value={current.maxWidth ?? 1000} onChange={(e) => patch(current.id!, { maxWidth: Number(e.target.value) })} />
                        <p className="hint">Teks yang lebih panjang otomatis diperkecil.</p>
                      </div>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!current.upper} onChange={(e) => patch(current.id!, { upper: e.target.checked })} /> HURUF KAPITAL</label>
                    </>
                  )}
                  {current.type === "qr" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="label">Posisi X</label>
                          <input type="number" className="input" value={current.x} onChange={(e) => patchPos(current.id!, { x: Number(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <label className="label">Posisi Y</label>
                          <input type="number" className="input" value={current.y} onChange={(e) => patchPos(current.id!, { y: Number(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <label className="label">Ukuran QR</label>
                      <input type="range" min={40} max={200} className="w-full" value={current.size} onChange={(e) => setLayout({ ...layout, items: layout.items.map((i) => (i.id === current.id ? { ...i, size: Number(e.target.value) } : i)) })} />
                    </div>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => { setLayout({ ...layout, items: layout.items.filter((i) => i.id !== current.id) }); setSelected(null); }}>
                    <Trash2 className="h-4 w-4" /> Hapus elemen
                  </button>
                </div>
              ) : (
                <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">Pilih elemen dari daftar di atas (atau klik langsung pada desain) untuk mengubahnya; seret pada pratinjau untuk memindahkan.</p>
              )}
            </div>
            <button className="btn btn-primary w-full" onClick={save} disabled={pending}>{pending ? "Menyimpan…" : "Simpan & gunakan desain ini"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
