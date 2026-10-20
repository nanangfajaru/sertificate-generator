import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import UpgradeTabs from "./UpgradeTabs";

export default async function UpgradeLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  const { count } = await createAdminClient().from("orders").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("status", "pending");
  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
      <div className="mt-3"><UpgradeTabs pending={count ?? 0} /></div>
      {children}
    </div>
  );
}
