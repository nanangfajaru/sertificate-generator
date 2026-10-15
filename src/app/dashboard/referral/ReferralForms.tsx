"use client";

import { useActionState } from "react";
import { createReferral, savePayoutInfo, type ReferralState } from "./actions";

export function CreateForm({ suggestion }: { suggestion: string }) {
  const [s, action, pending] = useActionState<ReferralState, FormData>(createReferral, {});
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label">Kode referral Anda</label>
        <input name="code" className="input font-mono uppercase" defaultValue={suggestion} maxLength={20} required placeholder="MISAL: BUDI25" />
        <p className="mt-1 text-xs text-slate-500">4–20 karakter, huruf dan angka. Kode tidak bisa diganti setelah dibuat.</p>
      </div>
      {s.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{s.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Membuat…" : "Buat kode referral"}</button>
    </form>
  );
}

export function PayoutForm({ defaultValue }: { defaultValue: string }) {
  const [s, action, pending] = useActionState<ReferralState, FormData>(savePayoutInfo, {});
  return (
    <form action={action} className="space-y-2">
      <label className="label">Rekening / e-wallet untuk pencairan komisi</label>
      <textarea name="payout" className="input" rows={2} maxLength={300} defaultValue={defaultValue} placeholder="Contoh: BCA 1234567890 a.n. Budi, atau DANA 0812xxxx" />
      <div className="flex items-center gap-3">
        <button className="btn btn-sm" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button>
        {s.ok && <span className="text-sm text-emerald-600">Tersimpan</span>}
      </div>
    </form>
  );
}
