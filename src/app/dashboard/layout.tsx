import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import Shell from "./Shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
  if (!profile.signup_source) {
    // Catat sumber pendaftar sekali (dari cookie ?ref / ?utm_source).
    const src = (await cookies()).get("sk_src")?.value;
    await createAdminClient().from("profiles").update({ signup_source: src ? decodeURIComponent(src).slice(0, 60) : "langsung" }).eq("id", profile.id);
  }
  const name = profile.full_name ?? profile.email ?? "Pengguna";
  return (
    <Shell name={name} email={profile.email} avatarUrl={profile.avatar_url} isPro={isPro} isAdmin={profile.is_admin} planUntil={isPro ? profile.plan_expires_at : null}>
      {children}
    </Shell>
  );
}
