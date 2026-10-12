"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== String(fd.get("confirm") ?? "")) return setError("Konfirmasi password tidak sama.");
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError("Gagal mengubah password. Minta tautan reset baru.");
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="label" htmlFor="password">Password baru</label>
        <input id="password" name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Ulangi password</label>
        <input id="confirm" name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Menyimpan…" : "Simpan password"}</button>
    </form>
  );
}
