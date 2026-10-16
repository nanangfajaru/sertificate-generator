"use client";

import { Check, Copy, Download, ExternalLink, Link2, Pencil, Share2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { setAlias } from "../../alias-actions";
import { qrPngDataUrl, qrSvg } from "@/lib/qr-export";

type Props = { programId: string; origin: string; slug: string; alias: string | null; isOpen: boolean; fileBase: string };

function save(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

export default function LinkCard({ programId, origin, slug, alias: initial, isOpen, fileBase }: Props) {
  const [alias, setAliasState] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const link = `${origin}/p/${alias || slug}`;
  const host = origin.replace(/^https?:\/\//, "");
  const svg = useMemo(() => qrSvg(link), [link]);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  function saveAlias() {
    setErr(null);
    start(async () => {
      const r = await setAlias(programId, draft);
      if (r.error) return setErr(r.error);
      setAliasState(r.alias ?? null);
      setDraft(r.alias ?? "");
      setEditing(false);
    });
  }

  return (
    <div className="card relative overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/60" />
      <div className="relative flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2.5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm"><Link2 className="h-4 w-4" /></span>
          Link pendaftaran
        </h2>
        <span className={`badge ${isOpen ? "badge-ok" : "badge-warn"}`}>{isOpen ? "Aktif" : "Ditutup"}</span>
      </div>

      {editing ? (
        <div className="relative mt-3">
          <label className="label" htmlFor="alias">Link pendek</label>
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <span className="shrink-0 bg-slate-50 px-2 py-2 text-xs text-slate-500">{host}/p/</span>
            <input id="alias" className="min-w-0 flex-1 px-2 py-2 text-sm outline-none" value={draft} maxLength={40} placeholder="nama-kegiatan" autoFocus onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
          </div>
          <p className="hint">Huruf kecil, angka, dan tanda hubung (3–40 karakter). Link lama tetap berfungsi.</p>
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary btn-sm" disabled={pending} onClick={saveAlias}>{pending ? "Menyimpan…" : "Simpan"}</button>
            <button className="btn btn-sm" onClick={() => { setEditing(false); setErr(null); setDraft(alias ?? ""); }}>Batal</button>
          </div>
        </div>
      ) : (
        <>
          <p className="relative mt-3 break-all rounded-lg border border-brand-200 bg-white px-3 py-2.5 font-mono text-sm font-medium text-brand-800 shadow-sm">{link}</p>
          <div className="relative mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Tersalin" : "Salin link"}
            </button>
            <a href={link} target="_blank" className="btn btn-sm"><ExternalLink className="h-4 w-4" /> Buka</a>
            <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> {alias ? "Ubah link" : "Buat link pendek"}</button>
          </div>
        </>
      )}

      <div className="relative mt-4 border-t border-brand-100 pt-4">
        <p className="text-sm font-medium">QR code form</p>
        <div className="mt-2 flex items-start gap-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1" dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg width="100%" height="100%" ') }} />
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-sm" onClick={() => save(qrPngDataUrl(link), `qr-${fileBase}.png`)}><Download className="h-4 w-4" /> Unduh PNG</button>
            <button type="button" className="btn btn-sm" onClick={() => save(URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), `qr-${fileBase}.svg`)}><Download className="h-4 w-4" /> Unduh SVG</button>
          </div>
        </div>
        <p className="hint">Cetak di poster atau tampilkan di layar acara agar peserta tinggal memindai.</p>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2 border-t border-brand-100 pt-4">
        <a className="btn btn-sm border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`Daftar hadir & dapatkan sertifikat di sini: ${link}`)}`}><Share2 className="h-4 w-4" /> WhatsApp</a>
        {canShare && (
          <button type="button" className="btn btn-sm" onClick={() => navigator.share({ title: "Pendaftaran", url: link }).catch(() => {})}><Share2 className="h-4 w-4" /> Bagikan…</button>
        )}
      </div>
      {!isOpen && <p className="relative mt-3 text-xs text-amber-700">Pendaftaran sedang ditutup; link tetap bisa dibuka tetapi peserta tidak dapat mendaftar.</p>}
    </div>
  );
}
