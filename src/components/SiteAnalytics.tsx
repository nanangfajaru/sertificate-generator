"use client";

import { Analytics } from "@vercel/analytics/next";

// Vercel Web Analytics (tanpa cookie). Kode sertifikat di /c/… disamarkan dan query string selain kampanye dibuang
// agar data pribadi (kode peserta, nomor pesanan, token) tidak ikut tercatat.
export default function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(e) => {
        const u = new URL(e.url);
        // Sisakan hanya parameter kampanye (utm_*, ref) untuk melihat asal pengunjung.
        for (const k of [...u.searchParams.keys()]) if (!k.startsWith("utm_") && k !== "ref") u.searchParams.delete(k);
        u.pathname = u.pathname.replace(/^\/c\/[^/]+/, "/c/[kode]");
        return { ...e, url: u.toString() };
      }}
    />
  );
}
