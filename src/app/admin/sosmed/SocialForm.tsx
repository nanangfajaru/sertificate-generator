"use client";

import { ExternalLink, Mail } from "lucide-react";
import { useActionState } from "react";
import SocialIcon from "@/components/SocialIcon";
import { saveSocial, type SocialState } from "./actions";

type Social = Record<"whatsapp" | "instagram" | "threads" | "tiktok" | "youtube" | "facebook" | "wa_message" | "email", string>;
type Field = { key: Exclude<keyof Social, "wa_message" | "email">; label: string; placeholder: string; hint: string; color: string };

const FIELDS: Field[] = [
  { key: "whatsapp", label: "WhatsApp Business", placeholder: "0812 3456 7890", hint: "Nomor ini tampil publik lewat tautan wa.me.", color: "bg-emerald-50 text-emerald-600" },
  { key: "instagram", label: "Instagram", placeholder: "@sertifikatku atau URL profil", hint: "", color: "bg-pink-50 text-pink-600" },
  { key: "threads", label: "Threads", placeholder: "@sertifikatku", hint: "", color: "bg-slate-100 text-slate-900" },
  { key: "youtube", label: "YouTube", placeholder: "@sertifikatku atau URL channel", hint: "", color: "bg-red-50 text-red-600" },
  { key: "tiktok", label: "TikTok", placeholder: "@sertifikatku (opsional)", hint: "", color: "bg-slate-100 text-slate-900" },
  { key: "facebook", label: "Facebook", placeholder: "Nama halaman atau URL (opsional)", hint: "", color: "bg-blue-50 text-blue-600" },
];

const openUrl = (k: Field["key"], v: string) => (k === "whatsapp" ? `https://wa.me/${v}` : v);

/** Form akun resmi: dikosongkan = disembunyikan dari situs. */
export default function SocialForm({ initial, waDefault }: { initial: Social; waDefault: string }) {
  const [s, action, pending] = useActionState(saveSocial, {} as SocialState);
  const v = (s.values ?? initial) as Social;
  // key berubah setelah tersimpan agar isian menampilkan nilai yang sudah dirapikan server.
  const formKey = JSON.stringify(v);
  return (
    <form key={formKey} action={action} className="card space-y-1 !p-0">
      <ul className="divide-y divide-slate-100">
        <li className="flex gap-3 p-4 sm:items-center">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Mail className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-4">
            <label htmlFor="s-email" className="block text-sm font-semibold text-slate-900">Email kontak</label>
            <div className="mt-1.5 sm:mt-0">
              <input id="s-email" name="email" type="email" defaultValue={v.email} placeholder="halo@sertifikatku.com" className="input text-sm" autoComplete="off" />
              <p className="mt-1 text-xs text-slate-500">Tampil di halaman Kontak.</p>
            </div>
          </div>
        </li>
        {FIELDS.map((f) => (
          <li key={f.key} className="flex gap-3 p-4 sm:items-center">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.color}`}><SocialIcon name={f.key} /></span>
            <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-4">
              <label htmlFor={`s-${f.key}`} className="block text-sm font-semibold text-slate-900">{f.label}</label>
              <div className="mt-1.5 sm:mt-0">
                <div className="flex gap-2">
                  <input id={`s-${f.key}`} name={f.key} defaultValue={v[f.key]} placeholder={f.placeholder} inputMode={f.key === "whatsapp" ? "tel" : undefined} className="input text-sm" autoComplete="off" />
                  {v[f.key] && <a href={openUrl(f.key, v[f.key])} target="_blank" rel="noopener noreferrer" className="btn btn-sm shrink-0 bg-white" title="Buka untuk mengecek"><ExternalLink className="h-4 w-4" /></a>}
                </div>
                {f.hint && <p className="mt-1 text-xs text-slate-500">{f.hint}</p>}
                {f.key === "whatsapp" && (
                  <input name="wa_message" defaultValue={v.wa_message} maxLength={200} placeholder={`Pesan pembuka (bawaan: "${waDefault}")`} className="input mt-2 text-sm" />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 p-4">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
        {s.ok && <span className="text-sm text-emerald-600">Tersimpan, situs sudah diperbarui.</span>}
        {s.error && <span className="text-sm text-red-600">{s.error}</span>}
      </div>
    </form>
  );
}
