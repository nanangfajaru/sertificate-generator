"use client";

import { useEffect, useState } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import LazyMount from "@/components/LazyMount";
import type { Layout } from "@/lib/certificate/types";

function Thumb({ id }: { id: string }) {
  const [layout, setLayout] = useState<Layout | null>(null);
  useEffect(() => {
    let alive = true;
    // Daftar template dimuat sebagai chunk terpisah, hanya saat pratinjau terlihat.
    import("@/lib/certificate/templates").then((m) => alive && setLayout(m.getTemplate(id).layout));
    return () => { alive = false; };
  }, [id]);
  return layout ? <CertificateSvg layout={layout} className="block h-auto w-full" /> : <div className="h-full w-full animate-pulse bg-slate-200" />;
}

export default function TemplateThumb({ id }: { id: string }) {
  return <LazyMount><Thumb id={id} /></LazyMount>;
}
