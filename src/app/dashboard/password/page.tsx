import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "../profile/ProfileForm";

export const metadata = { title: "Ganti password" };

export default async function PasswordPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ganti password</h1>
        <p className="text-sm text-slate-500">Gunakan minimal 8 karakter. Akun yang masuk dengan Google juga bisa menambahkan password di sini.</p>
      </div>
      <PasswordForm />
    </div>
  );
}
