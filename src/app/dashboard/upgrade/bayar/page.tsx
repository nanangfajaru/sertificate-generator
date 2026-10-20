import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPricing, midtransConfigured } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderSummary from "../OrderSummary";

export const metadata = { title: "Ringkasan pesanan" };

export default async function PayPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const plan = (await searchParams).plan === "monthly" ? "monthly" : "yearly";
  const { isPro, profile } = await requireUser();
  const pricing = await getPricing(createAdminClient());
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard/upgrade/paket" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Pilihan paket</Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-navy">Ringkasan pesanan</h1>
      <p className="mt-1 text-sm text-slate-500">Periksa paket, pakai voucher bila ada, lalu lanjutkan ke pembayaran.</p>
      <OrderSummary
        pricing={pricing}
        configured={midtransConfigured()}
        initialPlan={plan}
        initialCode={(await cookies()).get("sk_ref")?.value ?? ""}
        proUntil={isPro ? profile.plan_expires_at : null}
      />
    </div>
  );
}
