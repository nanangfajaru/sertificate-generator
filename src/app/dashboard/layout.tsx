import Logo from "@/components/Logo";
import { requireUser } from "@/lib/auth";
import UserMenu from "./UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
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
