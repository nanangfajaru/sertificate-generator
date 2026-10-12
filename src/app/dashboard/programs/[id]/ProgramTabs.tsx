"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProgramTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/dashboard/programs/${id}`;
  const tabs = [
    [base, "Ringkasan"],
    [`${base}/form`, "Form pendaftaran"],
    [`${base}/design`, "Sertifikat"],
    [`${base}/participants`, "Peserta"],
  ];
  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${pathname === href ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
