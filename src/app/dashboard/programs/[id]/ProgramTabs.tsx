"use client";

import { ClipboardList, LayoutDashboard, Palette, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProgramTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/dashboard/programs/${id}`;
  const tabs = [
    [base, "Ringkasan", LayoutDashboard],
    [`${base}/design`, "Sertifikat", Palette],
    [`${base}/form`, "Form pendaftaran", ClipboardList],
    [`${base}/participants`, "Peserta", Users],
  ] as const;
  return (
    <nav className="mt-5 flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {tabs.map(([href, label, Icon]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
