"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export type PaymentInfo = { code: string; biller?: string; expires_at?: string };

// Nomor panjang dipisah per 4 digit agar mudah dibaca; kode pendek (mis. 70012) dibiarkan utuh.
const group = (s: string) => (s.length >= 8 ? s.replace(/(\d{4})(?=\d)/g, "$1 ") : s);
const until = (s: string) => new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

function Code({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-500">{label}</p>
      <button
        type="button"
        title="Salin"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          } catch {}
        }}
        className="group mt-0.5 flex items-center gap-2 text-left"
      >
        <span className="font-mono text-base font-semibold tracking-wide text-navy">{group(value)}</span>
        {done ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-700" />}
      </button>
    </div>
  );
}

/** Nomor VA / kode bayar pesanan menunggu bayar. Mandiri Bill butuh dua kode, ditampilkan berdampingan dalam satu kotak. */
export default function PaymentCode({ method, info }: { method: string | null; info: PaymentInfo }) {
  const mandiri = !!info.biller;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-left">
      <p className="text-xs font-semibold text-slate-700">{method ? `Bayar via ${method}` : "Kode pembayaran"}</p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {mandiri && <Code label="Kode perusahaan" value={info.biller!} />}
        <Code label={mandiri ? "Kode bayar" : /Virtual Account/i.test(method ?? "") ? "Nomor Virtual Account" : "Kode bayar"} value={info.code} />
      </div>
      {mandiri && <p className="mt-2 text-[11px] leading-relaxed text-slate-600">Livin&apos; by Mandiri: <b>Bayar → E-Commerce → Midtrans</b> (kode {info.biller}), lalu masukkan kode bayar.</p>}
      {info.expires_at && <p className="mt-1.5 text-[11px] text-amber-800">Bayar sebelum {until(info.expires_at)} WIB</p>}
    </div>
  );
}
