"use client";

import { useActionState, useRef } from "react";
import { createVoucher } from "./actions";

export default function VoucherForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (p: unknown, fd: FormData) => {
    const r = await createVoucher(p, fd);
    if (r.ok) ref.current?.reset();
    return r;
  }, {} as { error?: string; ok?: boolean });

  return (
    <form ref={ref} action={action} className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <label className="label">Kode voucher</label>
        <input name="code" className="input uppercase" required placeholder="MISAL: BUDI10" maxLength={32} />
      </div>
      <div className="lg:col-span-2">
        <label className="label">Pemilik / referrer</label>
        <input name="label" className="input" placeholder="Nama pembagi voucher" maxLength={80} />
      </div>
      <div>
        <label className="label">Diskon pembeli (%)</label>
        <input name="discount" type="number" min={0} max={100} defaultValue={10} className="input" required />
      </div>
      <div>
        <label className="label">Komisi referrer (%)</label>
        <input name="commission" type="number" min={0} max={100} defaultValue={10} className="input" required />
      </div>
      <div className="lg:col-span-2">
        <label className="label">Maks. pemakaian (kosong = tak terbatas)</label>
        <input name="maxUses" type="number" min={1} className="input" />
      </div>
      <div className="lg:col-span-2">
        <label className="label">Berlaku sampai (opsional)</label>
        <input name="expires" type="date" className="input" />
      </div>
      <div className="flex items-end lg:col-span-2">
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Menyimpan…" : "Buat voucher"}</button>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 sm:col-span-2 lg:col-span-6">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700 sm:col-span-2 lg:col-span-6">Voucher dibuat.</p>}
    </form>
  );
}
