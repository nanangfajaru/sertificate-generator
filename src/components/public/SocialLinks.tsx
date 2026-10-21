import SocialIcon from "@/components/SocialIcon";
import { SOCIAL_LABEL, getSocial, socialLinks } from "@/lib/social";

/** Deretan ikon akun resmi (diatur di Admin → Sosial media). Tidak tampil bila belum ada yang diisi. */
export default async function SocialLinks({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const links = socialLinks(await getSocial());
  if (!links.length) return null;
  const tone = dark ? "border-white/15 text-slate-300 hover:border-amber-400 hover:bg-amber-400 hover:text-navy" : "border-slate-200 text-slate-500 hover:border-navy hover:bg-navy hover:text-white";
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, href }) => (
        <li key={key}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`SertifikatKu di ${SOCIAL_LABEL[key]}`} title={SOCIAL_LABEL[key]} className={`grid h-9 w-9 place-items-center rounded-full border transition ${tone}`}>
            <SocialIcon name={key} className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
