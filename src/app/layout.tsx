import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sertifikat Online – penerbitan sertifikat digital untuk setiap kegiatan", template: "%s · Sertifikat Online" },
  description: "Kumpulkan data peserta melalui satu tautan, setujui, lalu terbitkan sertifikat PDF lengkap dengan QR verifikasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}
