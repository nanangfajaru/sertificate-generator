import { requireAdmin } from "@/lib/auth";
import { WA_MESSAGE_DEFAULT, getSocial } from "@/lib/social";
import SocialForm from "./SocialForm";

export const metadata = { title: "Kontak & sosmed · Admin" };

export default async function SocialPage() {
  await requireAdmin();
  const social = await getSocial();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontak &amp; sosial media</h1>
        <p className="mt-1 text-sm text-slate-500">Kontak & akun resmi SertifikatKu. Akun yang diisi tampil sebagai ikon di footer situs dan halaman Kontak, tombol WhatsApp di Kontak & menu pengguna, serta dikenali Google sebagai akun resmi. Kosongkan untuk menyembunyikan.</p>
      </div>
      <SocialForm initial={social} waDefault={WA_MESSAGE_DEFAULT} />
    </div>
  );
}
