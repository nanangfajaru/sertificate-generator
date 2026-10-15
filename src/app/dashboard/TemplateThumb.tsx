"use client";

import { useEffect, useState } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import LazyMount from "@/components/LazyMount";
import { brandLayout } from "@/lib/certificate/branding";
import { resolveLayout, type ProgramLike } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";

export type ThumbProps = {
  program: Omit<ProgramLike, "mapping">;
  certMode: "template" | "custom";
  templateId: string;
  /** desain sendiri aktif (mode custom) beserta gambar latarnya */
  designLayout?: Layout | null;
  bgUrl?: string | null;
  /** URL bertanda waktu: logo, sig1, sig2 */
  images: Record<string, string>;
};

function Thumb(p: ThumbProps) {
  const [base, setBase] = useState<Layout | null>(p.certMode === "custom" ? (p.designLayout ?? null) : null);
  useEffect(() => {
    if (p.certMode !== "template") return;
    let alive = true;
    // Daftar template dimuat sebagai chunk terpisah, hanya saat pratinjau terlihat.
    import("@/lib/certificate/templates").then((m) => alive && setBase(m.getTemplate(p.templateId).layout));
    return () => { alive = false; };
  }, [p.certMode, p.templateId]);

  if (!base) return <div className="h-full w-full animate-pulse bg-slate-200" />;
  // Pratinjau memakai data kegiatan sebenarnya dan nama peserta contoh.
  const resolved = resolveLayout(base, {
    program: { ...p.program, mapping: { name: "n", extra: "e" } },
    data: { n: "Nama Peserta", e: "" },
    certNumber: "001/SERT/X/2026",
    verifyUrl: "https://sertifikatku.com/c/contoh",
  });
  const layout = brandLayout(resolved, { certMode: p.certMode, templateId: p.templateId, logo: true, sig1: !!p.images.sig1, sig2: !!p.images.sig2 });
  return <CertificateSvg layout={layout} backgroundUrl={p.bgUrl ?? null} images={p.images} logoPlaceholder={p.certMode === "template" && !p.images.logo} className="block h-auto w-full" />;
}

export default function TemplateThumb(p: ThumbProps) {
  return <LazyMount><Thumb {...p} /></LazyMount>;
}
