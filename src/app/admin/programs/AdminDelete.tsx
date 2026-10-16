"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminDeleteParticipant, adminDeleteProgram } from "../actions";

/** Tombol hapus program (admin). Meminta ketik nama program agar tidak terhapus tak sengaja. */
export function DeleteProgramButton({ id, name, participants }: { id: string; name: string; participants: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      disabled={pending}
      onClick={() => {
        const typed = prompt(`Hapus program "${name}" beserta ${participants} peserta secara permanen?\n\nSertifikat yang sudah terbit tidak bisa dibuka lagi. Ketik HAPUS untuk melanjutkan:`);
        if (typed?.trim().toUpperCase() !== "HAPUS") return;
        start(async () => {
          const r = await adminDeleteProgram(id);
          if (r.error) return alert(r.error);
          router.push("/admin/programs");
          router.refresh();
        });
      }}
    >
      <Trash2 className="h-4 w-4" /> {pending ? "Menghapus…" : "Hapus program"}
    </button>
  );
}

/** Tombol hapus satu peserta (admin). */
export function DeleteParticipantButton({ programId, id, name }: { programId: string; id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      disabled={pending}
      aria-label={`Hapus ${name}`}
      title="Hapus peserta"
      onClick={() => {
        if (!confirm(`Hapus peserta "${name}" secara permanen? Link & QR sertifikatnya tidak bisa dibuka lagi.`)) return;
        start(async () => {
          const r = await adminDeleteParticipant(programId, id);
          if (r.error) return alert(r.error);
          router.refresh();
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
