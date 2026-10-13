"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Menunda render anak sampai mendekati layar. Dipakai untuk daftar panjang pratinjau sertifikat
 * agar halaman tidak merender puluhan SVG sekaligus. Ruang tetap dipesan lewat aspect-ratio.
 */
export default function LazyMount({ children, aspect = "842 / 595", className }: { children: React.ReactNode; aspect?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);

  return (
    <div ref={ref} className={className} style={{ aspectRatio: aspect }}>
      {on ? children : null}
    </div>
  );
}
