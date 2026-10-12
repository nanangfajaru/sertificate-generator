import Link from "next/link";
import { Award } from "lucide-react";
import GoogleButton from "./GoogleButton";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm text-center">
        <Link href="/" className="mx-auto mb-4 flex w-fit items-center gap-2 font-semibold">
          <Award className="h-6 w-6 text-brand-600" /> Sertifikat Online
        </Link>
        <h1 className="text-xl font-semibold">Masuk atau daftar</h1>
        <p className="mt-1 text-sm text-slate-500">Akun baru otomatis dibuat saat pertama kali masuk, dengan paket Free.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700">Login gagal. Silakan coba lagi.</p>}
        <div className="mt-6">
          <GoogleButton next={next} />
        </div>
        <p className="mt-6 text-xs text-slate-400">Dengan masuk, kamu menyetujui penggunaan layanan ini.</p>
      </div>
    </main>
  );
}
