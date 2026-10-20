import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderHistory, { type HistoryRow } from "../OrderHistory";

export const metadata = { title: "Riwayat transaksi" };

export default async function OrderHistoryPage() {
  const { profile } = await requireUser();
  // Riwayat pembelian milik pengguna ini saja.
  const { data } = await createAdminClient()
    .from("orders")
    .select("order_id, plan, base_amount, discount_amount, amount, voucher_code, status, payment_url, payment_method, paid_at, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Riwayat transaksi</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500">Pembelian paket Pro Anda. Pesanan yang belum dibayar bisa dilanjutkan, diganti metode bayarnya, atau dibatalkan. Invoice tersedia untuk pesanan lunas.</p>
      <OrderHistory rows={(data ?? []) as HistoryRow[]} />
    </div>
  );
}
