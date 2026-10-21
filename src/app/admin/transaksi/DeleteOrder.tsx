"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteOrder } from "./actions";

export default function DeleteOrder({ orderId, paid }: { orderId: string; paid: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-sm text-red-600 hover:bg-red-50"
      disabled={pending}
      title="Hapus transaksi"
      aria-label={`Hapus transaksi ${orderId}`}
      onClick={() => {
        const warn = paid ? "\n\nTransaksi ini LUNAS: pendapatan & komisi ikut berkurang. Status Pro pengguna tidak berubah (atur manual di menu Pengguna bila perlu)." : "";
        if (confirm(`Hapus transaksi ${orderId} secara permanen?${warn}`)) start(async () => { const r = await deleteOrder(orderId); if (r.error) alert(r.error); });
      }}
    >
      <Trash2 className="h-4 w-4" /> {pending ? "…" : ""}
    </button>
  );
}
