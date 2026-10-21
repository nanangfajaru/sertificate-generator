"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Vercel Web Analytics + Speed Insights (tanpa cookie, skrip kecil dimuat setelah halaman tampil).
// Kode sertifikat di /c/… disamarkan dan query string selain kampanye dibuang
// agar data pribadi (kode peserta, nomor pesanan, token) tidak ikut tercatat.
function clean(url: string) {
  const u = new URL(url);
  // Sisakan hanya parameter kampanye (utm_*, ref) untuk melihat asal pengunjung.
  for (const k of [...u.searchParams.keys()]) if (!k.startsWith("utm_") && k !== "ref") u.searchParams.delete(k);
  u.pathname = u.pathname.replace(/^\/c\/[^/]+/, "/c/[kode]");
  return u.toString();
}

export default function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={(e) => ({ ...e, url: clean(e.url) })} />
      <SpeedInsights beforeSend={(e) => ({ ...e, url: clean(e.url) })} />
    </>
  );
}
