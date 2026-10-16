import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock, HeartHandshake, ShieldCheck } from "lucide-react";
import PublicShell from "@/components/public/PublicShell";
import { siteUrl } from "@/lib/util";

export const metadata = {
  title: "Tentang Kami",
  description: "SertifikatKu membantu panitia acara di Indonesia menerbitkan sertifikat online secara otomatis, rapi, dan bisa diverifikasi.",
  alternates: { canonical: `${siteUrl()}/tentang` },
};

const VALUES = [
  { icon: Clock, title: "Hemat waktu panitia", text: "Pekerjaan yang biasanya makan berjam-jam setelah acara, dari rekap nama sampai kirim satu per satu, kami ubah jadi otomatis." },
  { icon: ShieldCheck, title: "Resmi dan bisa dicek", text: "Setiap sertifikat punya nomor dan QR. Siapa pun bisa memastikan keasliannya, dan panitia bisa mencabutnya bila perlu." },
  { icon: HeartHandshake, title: "Mudah untuk semua", text: "Tidak perlu keahlian desain atau teknis. Cukup isi data acara, pilih template, lalu bagikan satu link." },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Tentang kami</p>
        <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Sertifikat acara, terbit otomatis.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          SertifikatKu adalah layanan buatan Indonesia untuk panitia seminar, webinar, pelatihan, lomba, dan kegiatan apa pun yang memberi sertifikat kepada pesertanya.
        </p>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kenapa kami membuat SertifikatKu</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Hampir setiap panitia mengalami hal yang sama: setelah acara selesai, masih ada pekerjaan panjang. Mengumpulkan data dari Google Form, memindahkan nama ke Canva atau Word satu per satu, memeriksa salah ketik, lalu mengirim sertifikat ke ratusan peserta secara manual.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Kami ingin bagian itu cukup sekali atur. Panitia membagikan satu link, peserta mengisi form, dan sertifikat langsung terbit, rapi dan siap dibagikan.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Yang kami kerjakan</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Form pendaftaran peserta lewat satu link atau QR",
                "Sertifikat PDF terbit otomatis atau setelah persetujuan panitia",
                "Nomor dan QR verifikasi keaslian di setiap sertifikat",
                "Puluhan template siap pakai, atau desain sendiri dari Canva",
                "Email otomatis ke peserta dan unduhan rekap kehadiran",
              ].map((t) => (
                <li key={t} className="flex gap-2.5"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">Yang kami pegang</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-5 w-5 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-slate-900 px-6 py-8 text-white sm:px-10">
          <div>
            <h2 className="text-xl font-bold">Punya acara dalam waktu dekat?</h2>
            <p className="mt-1 text-sm text-slate-300">Coba gratis, atau tanyakan dulu kebutuhan Anda kepada kami.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/kontak" className="btn border-slate-600 bg-transparent text-white hover:bg-slate-800">Hubungi kami</Link>
            <Link href="/login" className="btn border-white bg-white font-semibold text-slate-900 hover:bg-slate-100">Mulai gratis <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
