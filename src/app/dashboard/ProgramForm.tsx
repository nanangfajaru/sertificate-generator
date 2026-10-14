"use client";

import { CalendarDays, PenLine, Workflow } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import SignatureUpload from "./SignatureUpload";
import { useActionState, useState } from "react";
import { CERT_TYPES, CUSTOM_TYPE, isPresetType, presetDescription } from "@/lib/cert-types";
import type { Program } from "@/lib/db";
import type { ActionState } from "./actions";

type Props = {
  defaultOrg?: string;
  sigUrls?: [string | null, string | null];
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  program?: Program;
  submitLabel: string;
};

export default function ProgramForm({ action, program: p, submitLabel, sigUrls, defaultOrg }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const edit = !!p;

  // Jenis sertifikat: pilihan bawaan atau teks sendiri. Kalimat deskripsi ikut menyesuaikan
  // selama belum diubah manual.
  const initialType = p?.cert_type ?? "Peserta";
  const [typeSel, setTypeSel] = useState(isPresetType(initialType) ? initialType : CUSTOM_TYPE);
  const [customType, setCustomType] = useState(isPresetType(initialType) ? "" : initialType);
  const [desc, setDesc] = useState(p?.description ?? presetDescription(initialType) ?? "atas partisipasinya dalam kegiatan");
  const [descEdited, setDescEdited] = useState(() => !!p && p.description !== presetDescription(initialType));
  const certType = typeSel === CUSTOM_TYPE ? customType : typeSel;

  function onTypeChange(v: string) {
    setTypeSel(v);
    const next = presetDescription(v);
    if (next && !descEdited) setDesc(next);
  }

  return (
    <form action={formAction} className="space-y-6">
      <section className="card space-y-4">
        <SectionTitle icon={CalendarDays} title="Data acara" hint="Informasi kegiatan yang tampil di formulir dan sertifikat." />
        <div>
          <label className="label" htmlFor="org_name">Nama instansi / penyelenggara</label>
          <input id="org_name" name="org_name" className="input" required defaultValue={p?.org_name ?? defaultOrg} placeholder="mis. Universitas Contoh Nusantara" />
        </div>
        <div>
          <label className="label" htmlFor="name">Nama kegiatan</label>
          <input id="name" name="name" className="input" required defaultValue={p?.name} placeholder="mis. Seminar Nasional Teknologi 2026" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="cert_type_sel">Jenis sertifikat</label>
            <select id="cert_type_sel" className="input" value={typeSel} onChange={(e) => onTypeChange(e.target.value)}>
              {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value}</option>)}
              <option value={CUSTOM_TYPE}>Lainnya (tulis sendiri)…</option>
            </select>
            {typeSel === CUSTOM_TYPE && (
              <input className="input mt-2" placeholder="mis. Peserta Terbaik" maxLength={60} required value={customType} onChange={(e) => setCustomType(e.target.value)} />
            )}
            <input type="hidden" name="cert_type" value={certType} />
          </div>
          <div>
            <label className="label" htmlFor="location">Lokasi</label>
            <input id="location" name="location" className="input" defaultValue={p?.location ?? ""} placeholder="mis. Jakarta / Online" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="start_date">Tanggal mulai</label>
            <input id="start_date" name="start_date" type="date" className="input" required defaultValue={p?.start_date} />
          </div>
          <div>
            <label className="label" htmlFor="end_date">Tanggal selesai <span className="font-normal text-slate-400">(opsional)</span></label>
            <input id="end_date" name="end_date" type="date" className="input" defaultValue={p?.end_date ?? ""} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">Kalimat sebelum nama kegiatan</label>
          <input id="description" name="description" className="input" required maxLength={150} value={desc} onChange={(e) => { setDesc(e.target.value); setDescEdited(true); }} />
          <p className="hint">Terisi otomatis sesuai jenis sertifikat dan boleh diubah. Tampil di atas nama kegiatan.</p>
        </div>
      </section>

      <section className="card space-y-4">
        <SectionTitle icon={PenLine} title="Penandatangan" hint="Nama, jabatan, dan tanda tangan yang muncul di sertifikat." />
        {[1, 2].map((n) => (
          <div key={n} className={`grid gap-4 sm:grid-cols-2 ${n === 2 ? "mt-8 border-t border-slate-200 pt-8" : ""}`}>
            <p className="text-sm font-semibold text-brand-700 sm:col-span-2">Penandatangan {n}{n === 2 && <span className="font-normal text-slate-400"> (opsional)</span>}</p>
            <div>
              <label className="label" htmlFor={`signer${n}_name`}>Nama</label>
              <input id={`signer${n}_name`} name={`signer${n}_name`} className="input" defaultValue={(p?.[`signer${n}_name` as "signer1_name"] ?? "") as string} />
            </div>
            <div>
              <label className="label" htmlFor={`signer${n}_title`}>Jabatan</label>
              <input id={`signer${n}_title`} name={`signer${n}_title`} className="input" defaultValue={(p?.[`signer${n}_title` as "signer1_title"] ?? "") as string} placeholder={n === 1 ? "Ketua Panitia" : "Dekan"} />
            </div>
            {p ? <SignatureUpload programId={p.id} n={n as 1 | 2} initialUrl={sigUrls?.[n - 1] ?? null} /> : n === 1 && <p className="hint sm:col-span-2">Tanda tangan (gambar) dapat diunggah setelah program dibuat.</p>}
          </div>
        ))}
      </section>

      <section className="card space-y-4">
        <SectionTitle icon={Workflow} title="Alur sertifikat" hint="Atur kapan sertifikat terbit dan siapa yang diberi tahu." />
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["auto", "Otomatis", "Sertifikat langsung terbit setelah peserta mengisi form."],
            ["manual", "Perlu approval", "Sertifikat terbit setelah Anda menyetujui peserta (bisa massal)."],
          ].map(([v, t, d]) => (
            <label key={v} className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="radio" name="approval_mode" value={v} defaultChecked={(p?.approval_mode ?? "auto") === v} className="mt-1" />
              <span><span className="block text-sm font-medium">{t}</span><span className="text-xs text-slate-500">{d}</span></span>
            </label>
          ))}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="notify_email" defaultChecked={p?.notify_email ?? true} className="mt-1" />
          <span>
            Kirim email ke peserta saat sertifikat terbit
            <span className="hint block">Berlaku untuk mode otomatis maupun approval. Memerlukan field bertipe Email pada formulir pendaftaran.</span>
          </span>
        </label>
        {edit && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_open" defaultChecked={p!.is_open} /> Pendaftaran dibuka
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="show_qr" defaultChecked={p!.show_qr} /> Tampilkan QR verifikasi di sertifikat
            </label>
            <div>
              <label className="label" htmlFor="number_format">Format nomor sertifikat</label>
              <input id="number_format" name="number_format" className="input font-mono" defaultValue={p!.number_format} />
              <p className="hint">Token: {"{no}"} urutan 3 digit, {"{bulan}"} bulan romawi, {"{tahun}"} tahun. Contoh hasil: 001/SERT/X/2026</p>
            </div>
          </>
        )}
      </section>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Tersimpan.</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : submitLabel}</button>
    </form>
  );
}
