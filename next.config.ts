import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font untuk PDF dibaca lewat fs di route handler, jadi harus ikut ter-bundle di Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./src/fonts/**"],
    "/c/**": ["./src/fonts/**"],
  },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  async headers() {
    return [
      // Nama file contoh tidak berubah walau gambarnya dibuat ulang, jadi jangan "immutable":
      // cache 1 hari, lalu browser cukup memeriksa ulang (304) sambil memakai versi lama.
      { source: "/samples/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" }] },
    ];
  },
  // Alamat lama (vercel.app) dialihkan ke domain utama.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "sertifikat-online.vercel.app" }], destination: "https://sertifikatku.com/:path*", permanent: true }];
  },
};

export default nextConfig;
