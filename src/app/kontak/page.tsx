import Link from "next/link";
import { Clock, Mail, MessageCircleQuestion } from "lucide-react";
import PublicShell from "@/components/public/PublicShell";
import { siteUrl } from "@/lib/util";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Hubungi Kami",
  description: "Pertanyaan, bantuan teknis, paket Pro, atau kerja sama? Hubungi tim SertifikatKu.",
  alternates: { canonical: `${siteUrl()}/kontak` },
};

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Hubungi kami</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900">Ada yang bisa kami bantu?</h1>
            <p className="mt-4 leading-relaxed text-slate-600">Tanyakan apa saja: cara memakai, kendala akun, paket Pro, sampai kerja sama untuk kampus, EO, atau komunitas Anda.</p>
            <dl className="mt-8 space-y-5 text-sm">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div><dt className="font-semibold text-slate-900">Email</dt><dd className="mt-0.5 select-all text-slate-600">nanangfajaru@gmail.com</dd></div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div><dt className="font-semibold text-slate-900">Waktu balas</dt><dd className="mt-0.5 text-slate-600">Biasanya dalam 1 hari kerja (Senin–Jumat, WIB).</dd></div>
              </div>
              <div className="flex gap-3">
                <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div><dt className="font-semibold text-slate-900">Pertanyaan umum</dt><dd className="mt-0.5 text-slate-600">Lihat dulu <Link href="/#faq" className="text-brand-700 hover:underline">FAQ</Link>, mungkin jawabannya sudah ada.</dd></div>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicShell>
  );
}
