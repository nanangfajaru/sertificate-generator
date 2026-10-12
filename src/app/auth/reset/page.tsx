import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import ResetForm from "./ResetForm";

export const metadata = { title: "Atur ulang password" };

export default async function ResetPage() {
  const s = await getSessionProfile();
  if (!s) redirect("/login");
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-semibold">Password baru</h1>
        <p className="mt-1 text-sm text-slate-500">Masukkan password baru untuk akun {s.profile.email}.</p>
        <ResetForm />
        <Link href="/dashboard" className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-800">Lewati</Link>
      </div>
    </main>
  );
}
