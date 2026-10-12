"use client";

import { useActionState } from "react";
import { submitRegistration } from "./actions";

type F = { id: string; label: string; type: string; required: boolean; options: string[] };

export default function RegisterForm({ slug, fields, manual }: { slug: string; fields: F[]; manual: boolean }) {
  const [state, action, pending] = useActionState(submitRegistration.bind(null, slug), {});
  return (
    <form action={action} className="space-y-4">
      {fields.map((f) => {
        const name = `f_${f.id}`;
        return (
          <div key={f.id}>
            <label className="label" htmlFor={name}>{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
            {f.type === "textarea" ? (
              <textarea id={name} name={name} className="input" rows={3} required={f.required} maxLength={2000} />
            ) : f.type === "select" ? (
              <select id={name} name={name} className="input" required={f.required} defaultValue="">
                <option value="" disabled>Pilih…</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input id={name} name={name} className="input" type={f.type === "tel" ? "tel" : f.type} inputMode={f.type === "number" ? "decimal" : undefined} step={f.type === "number" ? "any" : undefined} required={f.required} maxLength={300} />
            )}
          </div>
        );
      })}
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-primary w-full py-2.5" disabled={pending}>{pending ? "Mengirim…" : "Daftar & dapatkan sertifikat"}</button>
      {manual && <p className="text-center text-xs text-slate-500">Sertifikat akan tersedia setelah disetujui penyelenggara.</p>}
    </form>
  );
}
