import { cookies } from "next/headers";
import { after } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Shell from "./Shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
  if (!profile.signup_source) {
    // Catat sumber pendaftar sekali (dari cookie ?ref / ?utm_source).
    // Dicatat setelah respons terkirim agar kunjungan pertama ke dashboard tidak menunggu.
    const src = (await cookies()).get("sk_src")?.value;
    after(async () => {
      await createAdminClient().from("profiles").update({ signup_source: src ? decodeURIComponent(src).slice(0, 60) : "langsung" }).eq("id", profile.id);
    });
  }
  const name = profile.full_name ?? profile.email ?? "Pengguna";
  return (
    <Shell name={name} email={profile.email} avatarUrl={profile.avatar_url} isPro={isPro} isAdmin={profile.is_admin} planUntil={isPro ? profile.plan_expires_at : null}>
      {children}
    </Shell>
  );
}
