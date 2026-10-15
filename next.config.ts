import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font untuk PDF dibaca lewat fs di route handler, jadi harus ikut ter-bundle di Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./src/fonts/**"],
    "/c/**": ["./src/fonts/**"],
  },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  async headers() {
    const longCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/samples/:path*", headers: longCache },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    ];
  },
  // Alamat lama (vercel.app) dialihkan ke domain utama.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "sertifikat-online.vercel.app" }], destination: "https://sertifikatku.com/:path*", permanent: true }];
  },
};

export default nextConfig;
