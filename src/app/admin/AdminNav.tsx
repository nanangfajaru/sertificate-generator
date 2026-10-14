"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["/admin", "Ringkasan"], ["/admin/users", "Pengguna"], ["/admin/programs", "Program"], ["/admin/vouchers", "Voucher"], ["/admin/email", "Email"]];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 text-sm">
      {items.map(([href, label]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} className={`rounded-md px-3 py-1.5 ${active ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}>{label}</Link>;
      })}
    </nav>
  );
}
