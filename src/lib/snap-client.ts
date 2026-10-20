// Pembayaran Midtrans Snap sebagai popup di atas halaman (browser saja).
// Tanpa NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, atau bila snap.js gagal dimuat, kembali ke halaman pembayaran Midtrans (redirect).

type SnapCallbacks = { onSuccess?: () => void; onPending?: () => void; onError?: () => void; onClose?: () => void };
type Snap = { pay: (token: string, cb: SnapCallbacks) => void };

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
let loading: Promise<Snap | null> | null = null;

function loadSnap(): Promise<Snap | null> {
  if (!CLIENT_KEY) return Promise.resolve(null);
  const w = window as Window & { snap?: Snap };
  if (w.snap) return Promise.resolve(w.snap);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    // Kunci sandbox diawali "SB-".
    s.src = CLIENT_KEY.startsWith("SB-") ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
    s.setAttribute("data-client-key", CLIENT_KEY);
    const timer = setTimeout(() => resolve(null), 8000);
    s.onload = () => { clearTimeout(timer); resolve(w.snap ?? null); };
    s.onerror = () => { clearTimeout(timer); loading = null; resolve(null); };
    document.head.appendChild(s);
  });
  return loading;
}

/** Muat snap.js lebih awal (mis. saat halaman ringkasan pesanan dibuka) agar popup muncul seketika. */
export function preloadSnap() {
  void loadSnap();
}

/**
 * Buka pembayaran. `url` = redirect_url Snap (token di bagian akhir) atau alamat internal (pesanan gratis).
 * Selesai/menunggu → ke halaman Berlangganan; ditutup → onClose (pembeli tetap di halaman).
 */
export async function openPayment(url: string, orderId: string | undefined, onClose: () => void) {
  if (url.startsWith("/") || !orderId) return window.location.assign(url);
  const snap = await loadSnap();
  const token = url.split("/").pop();
  if (!snap || !token) return window.location.assign(url);
  const done = () => window.location.assign(`/dashboard/upgrade?order=${encodeURIComponent(orderId)}`);
  snap.pay(token, { onSuccess: done, onPending: done, onError: () => window.location.assign(url), onClose });
}
