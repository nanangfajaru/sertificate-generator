import Link from "next/link";
import { Clock, Mail, MessageCircleQuestion } from "lucide-react";
import PublicShell from "@/components/public/PublicShell";
import SocialLinks from "@/components/public/SocialLinks";
import SocialIcon from "@/components/SocialIcon";
import { getSocial, socialLinks, waLink } from "@/lib/social";
import { siteUrl } from "@/lib/util";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Hubungi Kami",
  description: "Pertanyaan, bantuan teknis, paket Pro, atau kerja sama? Hubungi tim SertifikatKu.",
  alternates: { canonical: `${siteUrl()}/kontak` },
};

export default async function ContactPage() {
  const social = await getSocial();
  const hasOthers = socialLinks(social).some((l) => l.key !== "whatsapp");
  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Hubungi kami</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900">Ada yang bisa kami bantu?</h1>
            <p className="mt-4 leading-relaxed text-slate-600">Tanyakan apa saja: cara memakai, kendala akun, paket Pro, sampai kerja sama untuk kampus, EO, atau komunitas Anda.</p>
            {social.whatsapp && (
              <a href={waLink(social.whatsapp, social.wa_message)} target="_blank" rel="noopener noreferrer" className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-100/70">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white"><SocialIcon name="whatsapp" className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">Chat via WhatsApp</span>
                  <span className="block text-sm text-slate-600">Paling cepat untuk pertanyaan singkat.</span>
                </span>
                <span className="hidden rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white sm:inline">Mulai chat</span>
              </a>
            )}
            <dl className="mt-8 space-y-5 text-sm">
              {social.email && (
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div><dt className="font-semibold text-slate-900">Email</dt><dd className="mt-0.5"><a href={`mailto:${social.email}`} className="select-all text-slate-600 hover:text-brand-700">{social.email}</a></dd></div>
                </div>
              )}
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div><dt className="font-semibold text-slate-900">Waktu balas</dt><dd className="mt-0.5 text-slate-600">Biasanya dalam 1 hari kerja (Senin–Jumat, WIB).</dd></div>
              </div>
              <div className="flex gap-3">
                <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div><dt className="font-semibold text-slate-900">Pertanyaan umum</dt><dd className="mt-0.5 text-slate-600">Lihat dulu <Link href="/#faq" className="text-brand-700 hover:underline">FAQ</Link>, mungkin jawabannya sudah ada.</dd></div>
              </div>
            </dl>
            {hasOthers && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-sm font-semibold text-slate-900">Ikuti kami</p>
                <p className="mt-0.5 text-sm text-slate-600">Tips, template baru, dan kabar fitur.</p>
                <SocialLinks className="mt-3" />
              </div>
            )}
          </div>
          <ContactForm />
        </div>
      </section>
    </PublicShell>
  );
}
