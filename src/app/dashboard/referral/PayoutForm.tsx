"use client";

import { useActionState } from "react";
import { savePayoutInfo, type ReferralState } from "./actions";

export default function PayoutForm({ defaultValue }: { defaultValue: string }) {
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
