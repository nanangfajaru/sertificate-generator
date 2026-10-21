import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";

export const SOCIAL_KEYS = ["whatsapp", "instagram", "threads", "tiktok", "youtube", "facebook"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
/** Akun resmi SertifikatKu (app_settings.social). Nilai berupa URL lengkap, kecuali `whatsapp` = nomor 62xxx. */
export type Social = Record<SocialKey, string> & { wa_message: string; email: string };

/** Email kontak publik sebelum admin pernah menyimpan pengaturan ini. */
export const CONTACT_EMAIL_DEFAULT = "nanangfajaru@gmail.com";
export const WA_MESSAGE_DEFAULT = "Halo SertifikatKu, saya mau tanya…";
export const SOCIAL_LABEL: Record<SocialKey, string> = { whatsapp: "WhatsApp", instagram: "Instagram", threads: "Threads", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };
const EMPTY: Social = { whatsapp: "", instagram: "", threads: "", tiktok: "", youtube: "", facebook: "", wa_message: "", email: CONTACT_EMAIL_DEFAULT };

/** Dibaca di halaman publik & dashboard, jadi di-cache; disegarkan saat admin menyimpan (tag "social"). */
export const getSocial = unstable_cache(
  async (): Promise<Social> => {
    const { data } = await createAdminClient().from("app_settings").select("value").eq("key", "social").maybeSingle();
    const v = (data?.value ?? {}) as Partial<Social>;
    const out = { ...EMPTY };
    for (const k of [...SOCIAL_KEYS, "wa_message", "email"] as const) if (typeof v[k] === "string") out[k] = v[k];
    return out;
  },
  ["social"],
  { tags: ["social"], revalidate: 86400 },
);

export const waLink = (number: string, message?: string) => `https://wa.me/${number}?text=${encodeURIComponent(message || WA_MESSAGE_DEFAULT)}`;

/** URL tiap akun yang terisi, berurutan sesuai SOCIAL_KEYS (WhatsApp sudah berisi pesan pembuka). */
export function socialLinks(s: Social): { key: SocialKey; href: string }[] {
  return SOCIAL_KEYS.filter((k) => s[k]).map((k) => ({ key: k, href: k === "whatsapp" ? waLink(s.whatsapp, s.wa_message) : s[k] }));
}

const handle = (re: RegExp, raw: string) => raw.match(re)?.[1] ?? null;

/** Menerima @username atau URL profil, mengembalikan URL baku; null bila formatnya tidak dikenali. */
export function normalizeSocial(key: SocialKey, input: string): string | null {
  const raw = input.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (!raw) return "";
  switch (key) {
    case "whatsapp": {
      let n = input.replace(/\D/g, "");
      if (n.startsWith("0")) n = "62" + n.slice(1);
      else if (n.startsWith("8")) n = "62" + n;
      return /^62\d{8,13}$/.test(n) ? n : null;
    }
    case "instagram": {
      const h = handle(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)?@?([A-Za-z0-9._]{1,30})$/i, raw);
      return h ? `https://www.instagram.com/${h}` : null;
    }
    case "threads": {
      const h = handle(/^(?:https?:\/\/)?(?:www\.)?(?:threads\.(?:net|com)\/)?@?([A-Za-z0-9._]{1,30})$/i, raw);
      return h ? `https://www.threads.com/@${h}` : null;
    }
    case "tiktok": {
      const h = handle(/^(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/)?@?([A-Za-z0-9._]{2,24})$/i, raw);
      return h ? `https://www.tiktok.com/@${h}` : null;
    }
    case "youtube": {
      const p = handle(/^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/((?:@|channel\/|c\/)[A-Za-z0-9._-]{2,100})$/i, raw);
      if (p) return `https://www.youtube.com/${p}`;
      const h = handle(/^@?([A-Za-z0-9._-]{3,30})$/, raw);
      return h ? `https://www.youtube.com/@${h}` : null;
    }
    case "facebook": {
      const h = handle(/^(?:https?:\/\/)?(?:www\.|m\.)?(?:facebook\.com\/|fb\.com\/)?([A-Za-z0-9.-]{5,80})$/i, raw);
      return h ? `https://www.facebook.com/${h}` : null;
    }
  }
}
