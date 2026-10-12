import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font untuk PDF dibaca lewat fs di route handler, jadi harus ikut ter-bundle di Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./src/fonts/**"],
    "/c/**": ["./src/fonts/**"],
  },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
};

export default nextConfig;
