"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { pendingSnapshot } from "./actions";

const TICK = 6000; // cek basis data tiap 6 detik
const SYNC_EVERY = 5; // tiap ±30 detik tanyakan juga ke Midtrans
const MAX_MS = 20 * 60 * 1000;

/** Selama ada pesanan menunggu bayar, halaman Berlangganan diperbarui otomatis begitu statusnya berubah. */
export default function PendingWatcher({ initialKey }: { initialKey: string }) {
  const router = useRouter();
  const key = useRef(initialKey);

  useEffect(() => {
    const started = Date.now();
    let n = 0;
    let busy = false;
    const check = async (sync: boolean) => {
      if (busy || document.hidden) return;
      busy = true;
      try {
        const s = await pendingSnapshot(sync);
        if (s.key !== key.current) {
          key.current = s.key;
          router.refresh();
        }
      } catch {}
      busy = false;
    };
    const timer = setInterval(() => {
      if (Date.now() - started > MAX_MS) return clearInterval(timer);
      n++;
      void check(n % SYNC_EVERY === 0);
    }, TICK);
    // Kembali dari aplikasi bank / tab lain: langsung cek ke Midtrans.
    const onFocus = () => void check(true);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [router]);

  return (
    <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" /> Menunggu pembayaran — status akan diperbarui otomatis setelah Anda membayar.
    </p>
  );
}
