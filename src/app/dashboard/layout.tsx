import Logo from "@/components/Logo";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import UserMenu from "./UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
  if (!profile.signup_source) {
    // Catat sumber pendaftar sekali (dari cookie ?ref / ?utm_source).
    const src = (await cookies()).get("sk_src")?.value;
    await createAdminClient().from("profiles").update({ signup_source: src ? decodeURIComponent(src).slice(0, 60) : "langsung" }).eq("id", profile.id);
  }
  const name = profile.full_name ?? profile.email ?? "Pengguna";
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/70 via-slate-50 to-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo href="/dashboard" size={32} />
          <UserMenu name={name} email={profile.email} avatarUrl={profile.avatar_url} isPro={isPro} isAdmin={profile.is_admin} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
