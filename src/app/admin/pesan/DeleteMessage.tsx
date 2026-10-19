"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteMessage } from "./actions";

export default function DeleteMessage({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-sm text-red-600 hover:bg-red-50"
      disabled={pending}
      aria-label={`Hapus pesan dari ${name}`}
      onClick={() => {
        if (confirm(`Hapus pesan dari "${name}" secara permanen?`)) start(() => deleteMessage(id));
      }}
    >
      <Trash2 className="h-4 w-4" /> {pending ? "Menghapus…" : "Hapus"}
    </button>
  );
}
