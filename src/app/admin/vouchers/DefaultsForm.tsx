"use client";

import { useActionState } from "react";
import { saveReferralDefaults } from "./actions";

export default function DefaultsForm({ discount, commission }: { discount: number; commission: number }) {
  const [s, action, pending] = useActionState(saveReferralDefaults, {} as { error?: string; ok?: boolean });
  return (
    <form action={action} className="card grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-4">
        <h2 className="font-semibold">Pengaturan master referral pengguna</h2>
        <p className="text-sm text-slate-500">Berlaku untuk semua kode referral yang dibuat pengguna sendiri (termasuk yang sudah ada). Voucher buatan admin memakai persentase sendiri.</p>
      </div>
      <div>
        <label className="label">Diskon pembeli (%)</label>
        <input name="discount" type="number" min={0} max={100} defaultValue={discount} className="input" required />
      </div>
      <div>
        <label className="label">Komisi pemilik kode (%)</label>
        <input name="commission" type="number" min={0} max={100} defaultValue={commission} className="input" required />
      </div>
      <div className="flex items-end"><button className="btn btn-primary w-full" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</button></div>
      <div className="flex items-end text-sm">{s.ok && <span className="text-emerald-600">Tersimpan</span>}{s.error && <span className="text-red-600">{s.error}</span>}</div>
    </form>
  );
}
