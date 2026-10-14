"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type ProfileState } from "./actions";

type P = { full_name: string; phone: string; organization: string; job_title: string };

export function InfoForm({ p }: { p: P }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  return (
    <form action={action} className="card space-y-4">
      <h2 className="font-semibold">Informasi dasar</h2>
      <div>
        <label className="label" htmlFor="full_name">Nama lengkap</label>
        <input id="full_name" name="full_name" className="input" required maxLength={80} defaultValue={p.full_name} autoComplete="name" />
        <p className="hint">Tampil di sapaan dashboard.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Nomor telepon / WhatsApp <span className="font-normal text-slate-400">(opsional)</span></label>
          <input id="phone" name="phone" type="tel" className="input" defaultValue={p.phone} placeholder="08xxxxxxxxxx" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="job_title">Jabatan <span className="font-normal text-slate-400">(opsional)</span></label>
          <input id="job_title" name="job_title" className="input" maxLength={80} defaultValue={p.job_title} placeholder="mis. Ketua Panitia" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="organization">Instansi / organisasi <span className="font-normal text-slate-400">(opsional)</span></label>
        <input id="organization" name="organization" className="input" maxLength={120} defaultValue={p.organization} placeholder="mis. Universitas Contoh Nusantara" />
        <p className="hint">Terisi otomatis sebagai nama penyelenggara saat membuat program baru.</p>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">Profil disimpan.</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan perubahan"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = String(fd.get("password") ?? "");
    if (password.length < 8) return setMsg({ ok: false, text: "Password minimal 8 karakter." });
    if (password !== String(fd.get("confirm") ?? "")) return setMsg({ ok: false, text: "Konfirmasi password tidak sama." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Gagal mengubah password. Coba keluar lalu masuk kembali." });
    form.reset();
    setMsg({ ok: true, text: "Password diperbarui." });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <h2 className="font-semibold">Password</h2>
        <p className="mt-1 text-sm text-slate-500">Ubah password, atau buat password agar akun yang masuk dengan Google juga bisa masuk lewat email.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Password baru</label>
          <input id="password" name="password" type="password" className="input" minLength={8} autoComplete="new-password" required />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Ulangi password</label>
          <input id="confirm" name="confirm" type="password" className="input" minLength={8} autoComplete="new-password" required />
        </div>
      </div>
      {msg && <p className={`rounded-lg p-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button className="btn" disabled={busy}>{busy ? "Menyimpan…" : "Ubah password"}</button>
    </form>
  );
}
