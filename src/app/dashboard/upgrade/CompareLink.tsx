"use client";

import { ArrowDown } from "lucide-react";

/** Tautan ke tabel perbandingan: membuka bagian lipat lalu menggulir ke sana. */
export default function CompareLink() {
  return (
    <button
      type="button"
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      onClick={() => {
        const el = document.getElementById("banding") as HTMLDetailsElement | null;
        if (!el) return;
        el.open = true;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      Lihat perbandingan lengkap Free vs Pro <ArrowDown className="h-4 w-4" />
    </button>
  );
}
