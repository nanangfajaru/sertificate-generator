"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteVoucher } from "./actions";

export default function DeleteButton({ id, code, uses }: { id: string; code: string; uses: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-sm text-red-600 hover:bg-red-50"
      disabled={pending}
      aria-label={`Hapus ${code}`}
      onClick={() => {
        const warn = uses > 0 ? `\n\nKode ini sudah dipakai ${uses}x. Riwayat pesanan tetap ada, tetapi statistik komisi kode ini tidak lagi terhitung.` : "";
        if (confirm(`Hapus kode ${code}? Kode tidak bisa dipakai lagi.${warn}`)) start(() => deleteVoucher(id));
      }}
    >
      <Trash2 className="h-4 w-4" /> Hapus
    </button>
  );
}
