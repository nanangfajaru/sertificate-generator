"use client";

import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FieldType } from "@/lib/db";
import { updateParticipantData } from "./edit-actions";
import { DEFAULT_ROLE, MANUAL_ROLES } from "@/lib/cert-types";

const OTHER = "__other__";

export type EditField = { id: string; label: string; type: FieldType; required: boolean; options: string[] };

/** Modal panitia untuk memperbaiki isian peserta (mis. salah ketik nama). */
export default function EditParticipantDialog({ programId, participantId, fields, nameId, initial, initialRole, issued, onClose }: {
  programId: string;
  participantId: string;
  fields: EditField[];
  nameId: string | null;
  initial: Record<string, string>;
  initialRole: string;
  /** sertifikat sudah terbit: beri tahu bahwa perubahan langsung terlihat */
  issued: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.id, initial[f.id] ?? ""])));
  // Dropdown peran: pilihan bawaan + "Lainnya…" (ketik sendiri). Peran khusus yang sudah ada tampil sebagai pilihan juga.
  const presets = [DEFAULT_ROLE, ...MANUAL_ROLES];
  const startRole = initialRole || DEFAULT_ROLE;
  const [roleSel, setRoleSel] = useState(presets.includes(startRole) ? startRole : OTHER);
  const [customRole, setCustomRole] = useState(presets.includes(startRole) ? "" : startRole);
  const role = roleSel === OTHER ? customRole : roleSel;
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      if (!role.trim()) return setErr("Tulis nama perannya.");
      const r = await updateParticipantData(programId, participantId, values, role);
      if (r.error) return setErr(r.error);
      router.refresh();
      onClose();
    });
  }

  const set = (id: string, v: string) => setValues((x) => ({ ...x, [id]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit data peserta">
      <form onSubmit={save} className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <p className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4 text-brand-600" /> Edit data peserta</p>
          <button type="button" className="btn btn-sm !px-2" onClick={onClose} aria-label="Tutup"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {issued && <p className="rounded-lg bg-brand-50 p-2.5 text-xs text-brand-800">Sertifikat peserta ini sudah terbit. Perubahan (mis. nama) langsung terlihat pada sertifikat dan unduhan berikutnya; nomor dan link sertifikat tetap sama.</p>}
          <div>
            <label className="label" htmlFor="edit-role">Peran</label>
            <select id="edit-role" className="input" value={roleSel} onChange={(e) => setRoleSel(e.target.value)}>
              {presets.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value={OTHER}>Lainnya… (ketik sendiri)</option>
            </select>
            {roleSel === OTHER && <input className="input mt-2" value={customRole} maxLength={40} onChange={(e) => setCustomRole(e.target.value)} placeholder="mis. MC, Host, Pemateri" autoFocus />}
            <p className="hint">Menentukan judul sertifikat, mis. <b>SERTIFIKAT {(role.trim() || DEFAULT_ROLE).toUpperCase()}</b>. Peran selain Peserta tidak dihitung kuota.</p>
          </div>
          {fields.map((f) => {
            const required = f.required || f.id === nameId;
            const common = { id: `f-${f.id}`, className: "input", value: values[f.id] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(f.id, e.target.value), required };
            return (
              <div key={f.id}>
                <label className="label" htmlFor={`f-${f.id}`}>{f.label}{required && <span className="text-red-500"> *</span>}</label>
                {f.type === "textarea" ? (
                  <textarea {...common} rows={3} maxLength={2000} />
                ) : f.type === "select" ? (
                  <select {...common}>
                    <option value="">— pilih —</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input {...common} type={f.type === "tel" ? "tel" : f.type} maxLength={300} step={f.type === "number" ? "any" : undefined} />
                )}
              </div>
            );
          })}
          {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button type="button" className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan perubahan"}</button>
        </div>
      </form>
    </div>
  );
}
