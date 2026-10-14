"use client";

import { BadgePercent, Check, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { checkVoucher, startCheckout, type VoucherCheck } from "./actions";

type Plans = { monthly: number; yearly: number };
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function Checkout({ prices, configured, saving, initialCode = "" }: { prices: Plans; configured: boolean; saving: number; initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [v, setV] = useState<VoucherCheck | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();

  const applied = v?.code && !v.error ? v : null;
  const price = (k: keyof Plans) => applied?.prices?.[k] ?? prices[k];

  function apply() {
    setErr(null);
    startCheck(async () => {
      const r = await checkVoucher(code);
      if (r.error) {
        setV(null);
        setErr(r.error);
      } else setV(r);
    });
  }

  async function pay(plan: "monthly" | "yearly") {
    setErr(null);
    setBusy(plan);
    const r = await startCheckout(plan, applied?.code ?? "");
    if (r.error || !r.url) {
      setBusy(null);
      return setErr(r.error ?? "Gagal memulai pembayaran");
    }
    window.location.href = r.url;
  }

  const Card = ({ k, title, unit, note, primary, badge }: { k: "monthly" | "yearly"; title: string; unit: string; note: string; primary?: boolean; badge?: string }) => (
    <div className={`card relative flex flex-col ${primary ? "border-brand-500 ring-2 ring-brand-100" : ""}`}>
      {badge && <span className="badge badge-pro absolute -top-3 right-5">{badge}</span>}
      <p className={`text-sm font-medium ${primary ? "text-brand-700" : "text-slate-500"}`}>{title}</p>
      <p className="mt-2 text-4xl font-bold">
        {rp(price(k))}
        <span className="text-base font-normal text-slate-500"> / {unit}</span>
      </p>
      {applied && applied.percent ? <p className="mt-1 text-sm text-slate-400 line-through">{rp(prices[k])}</p> : null}
      <p className="mt-2 flex-1 text-sm text-slate-600">{note}</p>
      <button className={`btn mt-4 w-full ${primary ? "btn-primary" : ""}`} disabled={!configured || busy !== null} onClick={() => pay(k)}>
        {busy === k ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengalihkan…</> : `Pilih ${unit === "bulan" ? "bulanan" : "tahunan"}`}
      </button>
    </div>
  );

  return (
    <div className="mt-8">
      <div className="card !p-4">
        <label className="flex items-center gap-2 text-sm font-medium"><BadgePercent className="h-4 w-4 text-brand-600" /> Punya kode voucher?</label>
        <div className="mt-2 flex gap-2">
          <input className="input uppercase" placeholder="Masukkan kode" value={code} maxLength={32} onChange={(e) => { setCode(e.target.value); if (v) setV(null); }} onKeyDown={(e) => e.key === "Enter" && code.trim() && apply()} />
          <button className="btn shrink-0" disabled={!code.trim() || checking} onClick={apply}>{checking ? "Memeriksa…" : "Pakai"}</button>
        </div>
        {applied && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Voucher <b>{applied.code}</b> dipakai{applied.percent ? ` — diskon ${applied.percent}%` : ""}.
            <button className="ml-1 text-slate-400 hover:text-slate-700" aria-label="Lepas voucher" onClick={() => { setV(null); setCode(""); }}><X className="h-4 w-4" /></button>
          </p>
        )}
      </div>

      {err && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card k="monthly" title="Pro Bulanan" unit="bulan" note="Fleksibel, perpanjang kapan saja." />
        <Card k="yearly" title="Pro Tahunan" unit="tahun" note={`Setara ${rp(Math.round(price("yearly") / 12))} per bulan — paling hemat.`} primary badge={`Hemat ${rp(saving)}`} />
      </div>
      {!configured && <p className="mt-3 text-center text-xs text-slate-500">Pembayaran online belum aktif. Hubungi admin untuk mengaktifkan paket Pro.</p>}
      <p className="mt-3 text-center text-xs text-slate-500">Pembayaran diproses aman oleh Midtrans (transfer bank, e-wallet, QRIS, kartu). Pro aktif otomatis setelah pembayaran berhasil.</p>
    </div>
  );
}
