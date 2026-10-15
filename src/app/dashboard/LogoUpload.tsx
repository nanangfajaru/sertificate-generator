"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { removeLogo, uploadLogo } from "./signature-actions";

export default function LogoUpload({ programId, initialUrl }: { programId: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  function pick(file: File) {
    setErr(null);
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const r = await uploadLogo(programId, fd);
      if (r.error) setErr(r.error);
      else setUrl(r.url ?? null);
      if (ref.current) ref.current.value = "";
    });
  }

  return (
    <div>
      <label className="label">Logo penyelenggara <span className="font-normal text-slate-400">(opsional)</span></label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid h-16 w-40 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="Logo penyelenggara" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-slate-400">Belum ada</span>}
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        <button type="button" className="btn btn-sm" disabled={pending} onClick={() => ref.current?.click()}>
          <ImagePlus className="h-4 w-4" /> {pending ? "Mengunggah…" : url ? "Ganti" : "Unggah"}
        </button>
        {url && (
          <button type="button" className="btn btn-danger btn-sm" disabled={pending} onClick={() => start(async () => { const r = await removeLogo(programId); if (r.error) setErr(r.error); else setUrl(null); })}>
            <Trash2 className="h-4 w-4" /> Hapus
          </button>
        )}
      </div>
      <p className="hint">PNG (disarankan latar transparan) atau JPG, maks. 1 MB, minimal sekitar 300 px. Tampil di bagian atas sertifikat dan halaman pendaftaran.</p>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
