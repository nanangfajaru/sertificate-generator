"use client";

import { useTransition } from "react";

export default function DeleteButton({ action }: { action: () => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-danger btn-sm mt-3"
      disabled={pending}
      onClick={() => {
        if (confirm("Hapus program ini beserta semua pesertanya?")) start(() => action());
      }}
    >
      {pending ? "Menghapus…" : "Hapus program"}
    </button>
  );
}
