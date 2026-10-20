"use client";

import { Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Tab halaman Berlangganan: paket & harga terpisah dari riwayat transaksi. */
export default function UpgradeTabs({ pending }: { pending: number }) {
  const path = usePathname();
  const tabs = [
    ["/dashboard/upgrade", "Paket & harga", Sparkles],
    ["/dashboard/upgrade/riwayat", "Riwayat transaksi", Receipt],
  ] as const;
  return (
    <nav className="mx-auto flex w-fit gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {tabs.map(([href, label, Icon]) => {
        const active = path === href;
        return (
          <Link key={href} href={href} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-gradient-to-b from-brand-700 to-brand-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
            <Icon className="h-4 w-4" /> {label}
            {href.endsWith("riwayat") && pending > 0 && <span className={`rounded-full px-1.5 text-[11px] font-semibold ${active ? "bg-amber-400 text-navy" : "bg-amber-100 text-amber-800"}`}>{pending}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
