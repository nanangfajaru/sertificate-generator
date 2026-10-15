"use client";

import { useActionState } from "react";
import type { Pricing } from "@/lib/billing";
import { savePricing } from "./actions";

export default function PricingForm({ pricing }: { pricing: Pricing }) {
  const [s, action, pending] = useActionState(savePricing, {} as { error?: string; ok?: boolean });
  const row = (key: "monthly" | "yearly", title: string) => (
    <>
      <div className="sm:col-span-4 text-sm font-medium text-slate-700">{title}</div>
      <div className="sm:col-span-2">
        <label className="label">Harga coret / normal (Rp)</label>
        <input name={`${key}List`} type="number" min={0} defaultValue={pricing[key].list} className="input" required />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Harga jual (Rp) — dasar diskon voucher</label>
        <input name={`${key}Price`} type="number" min={1} defaultValue={pricing[key].price} className="input" required />
      </div>
    </>
  );
  return (
    <form action={action} className="card grid gap-3 sm:grid-cols-4">
      <div className="sm:col-span-4">
        <h2 className="font-semibold">Harga paket Pro</h2>
        <p className="text-sm text-slate-500">Harga coret hanya tampilan (dicoret). Diskon voucher dan komisi referral dihitung dari harga jual; pembeli membayar harga jual dikurangi diskon voucher.</p>
      </div>
      {row("monthly", "Pro Bulanan")}
      {row("yearly", "Pro Tahunan")}
      <div className="sm:col-span-4 flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan harga"}</button>
        {s.ok && <span className="text-sm text-emerald-600">Tersimpan</span>}
        {s.error && <span className="text-sm text-red-600">{s.error}</span>}
      </div>
    </form>
  );
}
