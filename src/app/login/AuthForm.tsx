"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "forgot";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function translate(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau password salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Periksa kotak masuk Anda.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("password should be at least")) return "Password minimal 8 karakter.";
  if (m.includes("rate limit") || m.includes("too many")) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export default function AuthForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();
    const supabase = createClient();
    const origin = window.location.origin;
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(translate(error.message));
        router.replace(safeNext(next));
        router.refresh();
      } else if (mode === "register") {
        if (password.length < 8) return setError("Password minimal 8 karakter.");
        if (password !== String(fd.get("confirm") ?? "")) return setError("Konfirmasi password tidak sama.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
        });
        if (error) return setError(translate(error.message));
        if (data.session) {
          router.replace(safeNext(next));
          router.refresh();
        } else {
          // Supabase mengembalikan user tanpa identitas bila email sudah terdaftar (anti-enumerasi).
          setInfo("Pendaftaran berhasil. Kami mengirim tautan konfirmasi ke email Anda. Buka tautan itu untuk mengaktifkan akun.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/auth/reset` });
        if (error) return setError(translate(error.message));
        setInfo("Jika email terdaftar, tautan untuk mengatur ulang password sudah dikirim.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-left">
      {mode !== "forgot" && (
        <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
          {(["login", "register"] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null); setInfo(null); }} className={`rounded-md py-1.5 font-medium ${mode === m ? "bg-white shadow-sm" : "text-slate-500"}`}>
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>
      )}
      {mode === "forgot" && <p className="mb-3 text-sm text-slate-600">Masukkan email akun Anda, kami kirim tautan untuk mengatur ulang password.</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="name">Nama</label>
            <input id="name" name="name" className="input" required maxLength={80} autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </div>
        {mode !== "forgot" && (
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" required minLength={mode === "register" ? 8 : undefined} autoComplete={mode === "register" ? "new-password" : "current-password"} />
          </div>
        )}
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="confirm">Ulangi password</label>
            <input id="confirm" name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {info && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{info}</p>}
        <button className="btn btn-primary w-full py-2.5" disabled={busy}>
          {busy ? "Memproses…" : mode === "login" ? "Masuk" : mode === "register" ? "Daftar" : "Kirim tautan reset"}
        </button>
      </form>

      <div className="mt-3 text-center text-sm">
        {mode === "login" && <button type="button" className="text-brand-700 hover:underline" onClick={() => { setMode("forgot"); setError(null); setInfo(null); }}>Lupa password?</button>}
        {mode === "forgot" && <button type="button" className="text-brand-700 hover:underline" onClick={() => { setMode("login"); setError(null); setInfo(null); }}>← Kembali masuk</button>}
      </div>
    </div>
  );
}
