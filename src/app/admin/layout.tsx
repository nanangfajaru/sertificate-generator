import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminShell from "./AdminShell";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Paralel: bila bukan admin, requireAdmin melempar 404 dan hasil hitungan diabaikan.
  const [{ profile, isPro }, { count: newMessages }] = await Promise.all([
    requireAdmin(),
    createAdminClient().from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "baru"),
  ]);
  return (
    <AdminShell name={profile.full_name ?? profile.email ?? "Admin"} email={profile.email} avatarUrl={profile.avatar_url} isPro={isPro} newMessages={newMessages ?? 0}>
      {children}
    </AdminShell>
  );
}
