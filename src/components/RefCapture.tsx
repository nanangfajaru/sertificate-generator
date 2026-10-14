"use client";

import { useEffect } from "react";

const DAYS = 30;

/** Menyimpan sumber kunjungan (?ref= / ?utm_source=) di cookie selama 30 hari. Kode ref juga dipakai untuk mengisi voucher. */
export default function RefCapture() {
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const ref = (q.get("ref") ?? "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
      const src = (q.get("utm_source") ?? "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40);
      const exp = new Date(Date.now() + DAYS * 864e5).toUTCString();
      if (ref) {
        document.cookie = `sk_ref=${ref}; expires=${exp}; path=/; SameSite=Lax`;
        if (!document.cookie.includes("sk_src=")) document.cookie = `sk_src=ref-${ref.toLowerCase()}; expires=${exp}; path=/; SameSite=Lax`;
      }
      if (src && !document.cookie.includes("sk_src=")) document.cookie = `sk_src=${src}; expires=${exp}; path=/; SameSite=Lax`;
    } catch {}
  }, []);
  return null;
}
