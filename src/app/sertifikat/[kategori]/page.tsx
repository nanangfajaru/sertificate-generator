import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import Logo from "@/components/Logo";
import HeaderMotif from "@/components/public/HeaderMotif";
import SampleCert from "@/components/SampleCert";
import { SEO_PAGES, getSeoPage } from "@/lib/seo-pages";
import { siteUrl } from "@/lib/util";

export const dynamicParams = false;
export const generateStaticParams = () => SEO_PAGES.map((p) => ({ kategori: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ kategori: string }> }): Promise<Metadata> {
  const p = getSeoPage((await params).kategori);
  if (!p) return {};
  return {
    title: p.title,
    description: p.intro.slice(0, 155),
    alternates: { canonical: `${siteUrl()}/sertifikat/${p.slug}` },
    openGraph: { title: `${p.title} · SertifikatKu`, description: p.intro.slice(0, 155), url: `${siteUrl()}/sertifikat/${p.slug}`, type: "website" },
  };
}

export default async function SeoPageView({ params }: { params: Promise<{ kategori: string }> }) {
  const p = getSeoPage((await params).kategori);
  if (!p) notFound();
  const cta = `/login?utm_source=seo-${p.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="relative bg-navy shadow-[0_1px_0_0_rgba(251,191,36,.45)]">
        <HeaderMotif />
        <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo size={32} light />
          <Link href={cta} className="btn btn-sm border-amber-400 bg-amber-400 font-semibold text-navy hover:bg-amber-300">Mulai gratis</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12">
        <nav className="text-xs text-slate-500"><Link href="/" className="hover:underline">Beranda</Link> / <span>{p.keyword}</span></nav>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{p.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{p.intro}</p>
        <p className="mt-2 text-sm text-slate-500">Cocok untuk: {p.who}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={cta} className="btn btn-primary">Buat {p.keyword} sekarang</Link>
          <Link href="/#template" className="btn">Lihat template</Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {p.templates.map((id, i) => (
            <div key={id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <SampleCert templateId={id} event={p.sampleEvent} priority={i === 0} sizes="(min-width: 640px) 480px, 90vw" />
            </div>
          ))}
        </div>

        <section className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Isi {p.keyword}</h2>
            <ul className="mt-4 space-y-2.5">
              {p.contents.map((c) => (<li key={c} className="flex gap-2.5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {c}</li>))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Tips untuk panitia</h2>
            <ul className="mt-4 space-y-2.5">
              {p.tips.map((c) => (<li key={c} className="flex gap-2.5 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {c}</li>))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Cara membuatnya</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {["Buat program dan pilih template", "Bagikan link atau QR formulir ke peserta", "Peserta mengisi data dan sertifikat langsung terbit"].map((t, i) => (
              <li key={t} className="rounded-xl border border-slate-200 p-4"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span><p className="mt-3 text-sm text-slate-700">{t}</p></li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Pertanyaan umum</h2>
          <dl className="mt-4 space-y-4">
            {p.faq.map(([q, a]) => (<div key={q} className="rounded-xl border border-slate-200 p-4"><dt className="font-medium">{q}</dt><dd className="mt-1 text-sm text-slate-600">{a}</dd></div>))}
          </dl>
        </section>

        <section className="mt-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Siap menerbitkan {p.keyword}?</h2>
          <p className="mt-2 text-brand-100">Gratis hingga 10 program dan 100 peserta per program.</p>
          <Link href={cta} className="btn mt-5 border-white bg-white font-semibold text-brand-700 hover:bg-brand-50">Daftar gratis</Link>
        </section>

        <nav className="mt-10 flex flex-wrap gap-2 text-sm">
          {SEO_PAGES.filter((x) => x.slug !== p.slug).map((x) => (<Link key={x.slug} href={`/sertifikat/${x.slug}`} className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-brand-500 hover:text-brand-700">{x.title}</Link>))}
        </nav>
      </main>
    </div>
  );
}
