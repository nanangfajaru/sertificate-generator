import Link from "next/link";

export const APP_NAME = "SertifikatKu";

/** Lambang: lembar sertifikat dengan segel emas bercentang. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#3730a3" /></linearGradient>
        <linearGradient id="lm-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#lm-bg)" />
      <rect x="11" y="14" width="42" height="30" rx="4.5" fill="#fff" />
      <rect x="17" y="21" width="22" height="3.4" rx="1.7" fill="#c7d2fe" />
      <rect x="17" y="28" width="30" height="2.6" rx="1.3" fill="#e0e7ff" />
      <rect x="17" y="34" width="16" height="2.6" rx="1.3" fill="#e0e7ff" />
      <path d="M40.5 46.5 38 57l5.2-3.2L48.4 57 46 46.5z" fill="#d97706" />
      <circle cx="43.2" cy="41" r="9.4" fill="url(#lm-gold)" stroke="#fff" strokeWidth="2.2" />
      <path d="m38.9 41.2 3 3 5.2-5.9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Lambang + nama. `size` mengatur tinggi lambang (px). */
export default function Logo({ href = "/", size = 32, className = "", light = false }: { href?: string | null; size?: number; className?: string; light?: boolean }) {
  const inner = (
    <>
      <LogoMark className="shrink-0" />
      <span className={`font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`} style={{ fontSize: size * 0.62 }}>
        Sertifikat<span className={light ? "text-amber-300" : "text-brand-600"}>Ku</span>
      </span>
    </>
  );
  const style = { gap: size * 0.28 };
  const mark = <style>{`.lg-mark svg{height:${size}px;width:${size}px}`}</style>;
  return href ? (
    <Link href={href} aria-label={APP_NAME} className={`lg-mark inline-flex items-center ${className}`} style={style}>{mark}{inner}</Link>
  ) : (
    <span className={`lg-mark inline-flex items-center ${className}`} style={style}>{mark}{inner}</span>
  );
}
