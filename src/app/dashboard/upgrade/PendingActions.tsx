"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cancelOrder, changePaymentMethod } from "./actions";
import { openPayment } from "@/lib/snap-client";

/** Tombol untuk pesanan yang menunggu bayar: lanjutkan, ganti metode, atau batalkan. */
export default function PendingActions({ orderId, paymentUrl }: { orderId: string; paymentUrl: string | null }) {
  const [busy, setBusy] = useState<"change" | "cancel" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();

  function change() {
    if (!confirm("Ganti metode pembayaran? Kode bayar / nomor VA yang lama akan dibatalkan dan Anda diarahkan ke halaman pembayaran baru.")) return;
    setErr(null);
    setBusy("change");
    start(async () => {
      const r = await changePaymentMethod(orderId);
      // Pesanan lama sudah dibatalkan; tutup popup → muat ulang agar riwayat menampilkan pesanan baru.
      if (r.url) return openPayment(r.url, r.orderId, () => window.location.reload());
      setBusy(null);
      setErr(r.error ?? "Gagal mengganti metode");
    });
  }
  function cancel() {
    if (!confirm("Batalkan pesanan ini? Kode bayar / nomor VA-nya tidak bisa dipakai lagi.")) return;
    setErr(null);
    setBusy("cancel");
    start(async () => {
      const r = await cancelOrder(orderId);
      setBusy(null);
      if (r.error) setErr(r.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-1.5 md:flex-nowrap">
        {paymentUrl && (
          <a href={paymentUrl} className="btn btn-primary btn-sm" onClick={(e) => { e.preventDefault(); void openPayment(paymentUrl, orderId, () => {}); }}>Lanjutkan bayar</a>
        )}
        <button type="button" className="btn btn-sm bg-white" disabled={!!busy} onClick={change}>{busy === "change" && <Loader2 className="h-4 w-4 animate-spin" />} Ganti metode</button>
        <button type="button" className="btn btn-sm bg-white text-red-600 hover:bg-red-50" disabled={!!busy} onClick={cancel}>{busy === "cancel" && <Loader2 className="h-4 w-4 animate-spin" />} Batalkan</button>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
