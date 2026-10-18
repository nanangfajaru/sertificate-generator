"use client";

import { ArrowRight, CalendarDays, Hash, Loader2, Mail, Phone, User } from "lucide-react";
import { startTransition, useActionState } from "react";
import { submitRegistration } from "./actions";

export type RegisterField = { id: string; label: string; type: string; required: boolean; options: string[] };

const ICON: Partial<Record<string, typeof Mail>> = { email: Mail, tel: Phone, number: Hash, date: CalendarDays };
const PLACEHOLDER: Record<string, string> = { email: "nama@email.com", tel: "08xxxxxxxxxx" };

export default function RegisterForm({ slug, fields, nameId, manual, emailNotify }: { slug: string; fields: RegisterField[]; nameId: string | null; manual: boolean; emailNotify: boolean }) {
  const [state, action, pending] = useActionState(submitRegistration.bind(null, slug), {});

  // Kirim lewat onSubmit (bukan prop action) agar isian tidak dikosongkan React saat server mengembalikan error.
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f) => {
        const name = `f_${f.id}`;
        const isName = f.id === nameId;
        const Icon = isName ? User : ICON[f.type];
        const cls = `input h-12 text-base sm:h-11 sm:text-sm ${Icon ? "pl-10" : ""}`;
        return (
          <div key={f.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-700" htmlFor={name}>{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
              {isName && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">Tercetak di sertifikat</span>}
            </div>
            {f.type === "textarea" ? (
              <textarea id={name} name={name} className="input text-base sm:text-sm" rows={3} required={f.required} maxLength={2000} />
            ) : (
              <div className="relative">
                {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
                {f.type === "select" ? (
                  <select id={name} name={name} className={cls} required={f.required} defaultValue="">
                    <option value="" disabled>Pilih…</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    id={name}
                    name={name}
                    className={cls}
                    type={f.type === "tel" ? "tel" : f.type}
                    inputMode={f.type === "number" ? "decimal" : undefined}
                    step={f.type === "number" ? "any" : undefined}
                    autoComplete={isName ? "name" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined}
                    placeholder={isName ? "Nama lengkap beserta gelar (jika ada)" : PLACEHOLDER[f.type]}
                    required={f.required}
                    maxLength={300}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p>}
      <button className="btn btn-primary group h-12 w-full text-base shadow-lg shadow-brand-600/20" disabled={pending}>
        {pending ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim…</> : <>Daftar &amp; dapatkan sertifikat <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" /></>}
      </button>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        {manual ? "Sertifikat tersedia setelah disetujui penyelenggara." : "Sertifikat langsung bisa diunduh setelah mendaftar."}
        {emailNotify && (manual ? " Tautannya akan dikirim ke email Anda saat disetujui." : " Tautannya juga dikirim ke email Anda.")}
      </p>
    </form>
  );
}
