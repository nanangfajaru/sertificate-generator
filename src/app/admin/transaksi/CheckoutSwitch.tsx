"use client";

import { Power } from "lucide-react";
import { useState, useTransition } from "react";
import { saveCheckoutSetting } from "./actions";

/** Saklar pembelian Pro: saat dimatikan, tombol beli di aplikasi dinonaktifkan dan pesan ini ditampilkan. */
export default function CheckoutSwitch({ enabled, message, fallback }: { enabled: boolean; message: string; fallback: string }) {
  const [on, setOn] = useState(enabled);
  const [msg, setMsg] = useState(message === fallback ? "" : message);
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save(nextOn: boolean) {
    setNote(null);
    start(async () => {
      const r = await saveCheckoutSetting(nextOn, msg);
      if (r.error) setNote(r.error);
      else {
        setOn(nextOn);
        setNote("Tersimpan.");
      }
    });
  }

  return (
    <div className={`rounded-xl border p-4 ${on ? "border-emerald-200 bg-emerald-50/50" : "border-amber-300 bg-amber-50"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${on ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}><Power className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Pembelian paket Pro: {on ? "Dibuka" : "Ditutup"}</p>
          <p className="text-xs text-slate-500">{on ? "Pengguna bisa membeli & memperpanjang Pro." : "Tombol beli dinonaktifkan; pesanan yang sudah dibuat tetap bisa dibayar."}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={pending}
          onClick={() => save(!on)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"} disabled:opacity-60`}
          aria-label="Buka/tutup pembelian"
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className="input text-sm" value={msg} maxLength={240} placeholder={`Pesan saat ditutup (bawaan: "${fallback}")`} onChange={(e) => setMsg(e.target.value)} />
        <button type="button" className="btn btn-sm shrink-0 justify-center" disabled={pending} onClick={() => save(on)}>Simpan pesan</button>
      </div>
      {note && <p className="mt-2 text-xs text-slate-600">{note}</p>}
    </div>
  );
}
