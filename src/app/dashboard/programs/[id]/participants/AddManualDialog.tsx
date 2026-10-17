"use client";

import { AlertTriangle, CheckCircle2, ChevronDown, Mic, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { MANUAL_ROLES } from "@/lib/cert-types";
import type { EditField } from "./EditParticipantDialog";
import { addManualParticipant } from "./edit-actions";

const OTHER = "__other__";

/**
 * Tombol + dialog untuk penyelenggara menambah pembicara, narasumber, moderator, panitia, dll.
 * (selain pendaftar umum). Sertifikat langsung terbit dengan judul sesuai peran.
 */
export default function AddManualDialog({ programId, fields, nameId, emailOn }: { programId: string; fields: EditField[]; nameId: string | null; emailOn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(MANUAL_ROLES[0]);
  const [custom, setCustom] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [more, setMore] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  /** notifikasi setelah dialog tertutup (hijau = berhasil, kuning = sertifikat tertahan) */
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const nameField = fields.find((f) => f.id === nameId);
  const emailField = fields.find((f) => f.type === "email");
  const others = fields.filter((f) => f !== nameField && f !== emailField);
  const finalRole = role === OTHER ? custom.trim() : role;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  function reset() {
    setValues({});
    setErr(null);
    setMore(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!finalRole) return setErr("Tulis nama perannya.");
    start(async () => {
      const r = await addManualParticipant(programId, { role: finalRole, data: values, sendEmail: emailOn && sendEmail && !!(emailField && values[emailField.id]?.trim()) });
      if (r.error) return setErr(r.error);
      // Berhasil: tutup form agar jelas datanya sudah masuk ke daftar.
      setOpen(false);
      setValues({});
      setToast(r.warning ? { ok: false, text: r.warning } : { ok: true, text: `${r.name} ditambahkan sebagai ${finalRole}. Sertifikat sudah terbit.` });
      router.refresh();
    });
  }

  const input = (f: EditField, required = false) => {
    const common = { id: `m-${f.id}`, className: "input", value: values[f.id] ?? "", required, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues((v) => ({ ...v, [f.id]: e.target.value })) };
    return f.type === "textarea" ? <textarea {...common} rows={2} maxLength={2000} />
      : f.type === "select" ? <select {...common}><option value="">— pilih —</option>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      : <input {...common} type={f.type === "tel" ? "tel" : f.type} maxLength={300} step={f.type === "number" ? "any" : undefined} />;
  };

  return (
    <>
      {toast && (
        <div role="status" className={`fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${toast.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
          {toast.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="min-w-0 flex-1">{toast.text}</span>
          <button type="button" className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100" onClick={() => setToast(null)} aria-label="Tutup"><X className="h-4 w-4" /></button>
        </div>
      )}
      <button type="button" className="btn btn-sm border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100" onClick={() => { reset(); setOpen(true); }} title="Tambah pembicara, narasumber, moderator, panitia, dll. (selain peserta)">
        <Mic className="h-4 w-4" /> Tambah pembicara / narasumber
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-6" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Tambah pembicara atau narasumber">
          <form onSubmit={submit} className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <p className="flex items-center gap-2 font-semibold"><Mic className="h-4 w-4 text-brand-600" /> Tambah pembicara / narasumber</p>
                <p className="mt-0.5 text-xs text-slate-500">Untuk selain peserta: pembicara, narasumber, moderator, panitia, juri, dll. Sertifikat langsung terbit sesuai perannya dan tidak dihitung kuota.</p>
              </div>
              <button type="button" className="btn btn-sm !px-2" onClick={() => setOpen(false)} aria-label="Tutup"><X className="h-4 w-4" /></button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div>
                <p className="label">Peran</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...MANUAL_ROLES, OTHER].map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-full border px-3 py-1 text-sm transition ${role === r ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                      {r === OTHER ? "Lainnya…" : r}
                    </button>
                  ))}
                </div>
                {role === OTHER && <input className="input mt-2" placeholder="mis. Pemateri, Host, MC" maxLength={40} value={custom} onChange={(e) => setCustom(e.target.value)} autoFocus />}
                {finalRole && <p className="hint">Judul sertifikat: <b>SERTIFIKAT {finalRole.toUpperCase()}</b></p>}
              </div>

              {nameField && (
                <div>
                  <label className="label" htmlFor={`m-${nameField.id}`}>{nameField.label} <span className="text-red-500">*</span></label>
                  {input(nameField, true)}
                </div>
              )}
              {emailField && (
                <div>
                  <label className="label" htmlFor={`m-${emailField.id}`}>{emailField.label} <span className="font-normal text-slate-400">(opsional)</span></label>
                  {input(emailField)}
                  {emailOn && (
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /> Kirim link sertifikat ke email ini
                    </label>
                  )}
                </div>
              )}

              {others.length > 0 && (
                <div className="rounded-lg border border-slate-200">
                  <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-700" onClick={() => setMore((m) => !m)}>
                    Isian lain dari formulir <span className="text-xs font-normal text-slate-400">(opsional)</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition ${more ? "rotate-180" : ""}`} />
                  </button>
                  {more && (
                    <div className="space-y-3 border-t border-slate-100 p-3">
                      {others.map((f) => (
                        <div key={f.id}>
                          <label className="label" htmlFor={`m-${f.id}`}>{f.label}</label>
                          {input(f)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : `Tambah ${finalRole || "orang"}`}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
