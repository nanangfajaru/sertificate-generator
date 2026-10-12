import CertificateSvg from "./CertificateSvg";
import { getTemplate } from "@/lib/certificate/templates";
import { resolveLayout } from "@/lib/certificate/sources";

export const SAMPLE_PROGRAM = {
  org_name: "Universitas Contoh Nusantara",
  name: "Seminar Nasional Teknologi 2026",
  cert_type: "Peserta",
  description: "atas partisipasinya dalam kegiatan",
  start_date: "2026-10-12",
  end_date: null,
  location: "Jakarta",
  signer1_name: "Dr. Budi Santoso",
  signer1_title: "Ketua Panitia",
  signer2_name: "Prof. Siti Aminah",
  signer2_title: "Dekan",
  mapping: { name: "n", extra: "e" },
};

export default function SampleCert({ templateId, name = "Nama Peserta", className }: { templateId: string; name?: string; className?: string }) {
  const layout = resolveLayout(getTemplate(templateId).layout, {
    program: SAMPLE_PROGRAM,
    data: { n: name, e: "" },
    certNumber: "001/SERT/X/2026",
    verifyUrl: "https://sertifikat.example/c/contoh",
  });
  return <CertificateSvg layout={layout} className={className ?? "h-auto w-full"} />;
}
