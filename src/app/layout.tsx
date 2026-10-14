import type { Metadata } from "next";
import "./globals.css";
import RefCapture from "@/components/RefCapture";

export const metadata: Metadata = {
  title: { default: "SertifikatKu – penerbitan sertifikat digital untuk setiap kegiatan", template: "%s · SertifikatKu" },
  description: "Kumpulkan data peserta melalui satu tautan, setujui, lalu terbitkan sertifikat PDF lengkap dengan QR verifikasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">
        <RefCapture />
        {children}
      </body>
    </html>
  );
}
