import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sertifikat Online – buat & bagikan e-sertifikat otomatis", template: "%s · Sertifikat Online" },
  description: "Buat program, bagikan link pendaftaran, dan sertifikat peserta terbit otomatis. Mulai gratis dengan login Google.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}
