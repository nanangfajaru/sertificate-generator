import Link from "next/link";

export const APP_NAME = "SertifikatKu";

/**
 * Lambang: sertifikat landscape dengan bingkai pindai, QR, dan centang emas (navy + emas).
 * Tanpa kotak latar; "dark" untuk latar gelap. Ikon aplikasi/favicon (berlatar) ada di src/app/icon.svg.
 */
const MARK = {
  light: '<rect x="5" y="15" width="44" height="34" rx="4.5" fill="#0f1d4a"/><rect x="10" y="22" width="14" height="3" rx="1.5" fill="#fff"/><rect x="10" y="28.5" width="10" height="2.4" rx="1.2" fill="#fff" opacity=".45"/><rect x="10" y="34" width="12" height="2.4" rx="1.2" fill="#fff" opacity=".45"/><rect x="30" y="18" width="29" height="29" rx="6" fill="#fff"/><path d="M33 26.98V23a2 2 0 0 1 2-2H38.98 M50.02 21H54a2 2 0 0 1 2 2V26.98 M56 38.02V42a2 2 0 0 1-2 2H50.02 M38.98 44H35a2 2 0 0 1-2-2V38.02" fill="none" stroke="#f5b301" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(44.5 32.5) scale(0.33) translate(-32 -32)"><rect x="14.5" y="14.5" width="11" height="11" rx="3" fill="none" stroke="#0f1d4a" stroke-width="5"/><rect x="38.5" y="14.5" width="11" height="11" rx="3" fill="none" stroke="#0f1d4a" stroke-width="5"/><rect x="14.5" y="38.5" width="11" height="11" rx="3" fill="none" stroke="#0f1d4a" stroke-width="5"/><circle cx="44" cy="44" r="10" fill="#f5b301"/><path d="m39 44.3 3.6 3.6 6.6-7.2" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>',
  dark: '<rect x="5" y="15" width="44" height="34" rx="4.5" fill="#fff"/><rect x="10" y="22" width="14" height="3" rx="1.5" fill="#0f1d4a"/><rect x="10" y="28.5" width="10" height="2.4" rx="1.2" fill="#0f1d4a" opacity=".45"/><rect x="10" y="34" width="12" height="2.4" rx="1.2" fill="#0f1d4a" opacity=".45"/><rect x="30" y="18" width="29" height="29" rx="6" fill="#0f1d4a"/><path d="M33 26.98V23a2 2 0 0 1 2-2H38.98 M50.02 21H54a2 2 0 0 1 2 2V26.98 M56 38.02V42a2 2 0 0 1-2 2H50.02 M38.98 44H35a2 2 0 0 1-2-2V38.02" fill="none" stroke="#f5b301" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(44.5 32.5) scale(0.33) translate(-32 -32)"><rect x="14.5" y="14.5" width="11" height="11" rx="3" fill="none" stroke="#fff" stroke-width="5"/><rect x="38.5" y="14.5" width="11" height="11" rx="3" fill="none" stroke="#fff" stroke-width="5"/><rect x="14.5" y="38.5" width="11" height="11" rx="3" fill="none" stroke="#fff" stroke-width="5"/><circle cx="44" cy="44" r="10" fill="#f5b301"/><path d="m39 44.3 3.6 3.6 6.6-7.2" fill="none" stroke="#0f1d4a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>',
};

// uid dipertahankan agar pemanggil lama tetap kompatibel (lambang tidak memakai gradien ber-id).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LogoMark({ className = "h-8 w-8", size, uid, tone = "light" }: { className?: string; size?: number; uid?: string; tone?: "light" | "dark" }) {
  return <svg viewBox="4 13 56 38" className={className} style={size ? { width: size * 1.47, height: size } : undefined} aria-hidden dangerouslySetInnerHTML={{ __html: MARK[tone] }} />;
}

/** Lambang + nama. `size` mengatur tinggi lambang (px). */
export default function Logo({ href = "/", size = 32, className = "", light = false, uid }: { href?: string | null; size?: number; className?: string; light?: boolean; uid?: string }) {
  const inner = (
    <>
      <LogoMark className="shrink-0" size={size} uid={uid} tone={light ? "dark" : "light"} />
      <span className={`font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`} style={{ fontSize: size * 0.62 }}>
        Sertifikat<span className={light ? "text-amber-400" : "text-brand-700"}>Ku</span>
      </span>
    </>
  );
  const style = { gap: size * 0.28 };
  return href ? (
    <Link href={href} aria-label={APP_NAME} className={`inline-flex items-center ${className}`} style={style}>{inner}</Link>
  ) : (
    <span className={`inline-flex items-center ${className}`} style={style}>{inner}</span>
  );
}
