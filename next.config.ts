import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font untuk PDF dibaca lewat fs di route handler, jadi harus ikut ter-bundle di Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./src/fonts/**"],
    "/c/**": ["./src/fonts/**"],
  },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  // Alamat lama (vercel.app) dialihkan ke domain utama.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "sertifikat-online.vercel.app" }], destination: "https://sertifikatku.com/:path*", permanent: true }];
  },
};

export default nextConfig;
