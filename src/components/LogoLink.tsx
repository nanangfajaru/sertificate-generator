"use client";

import Link from "next/link";

/**
 * Tautan logo. Bila sudah berada di halaman tujuan (mis. di landing lalu klik logo), Next.js tidak
 * menggulir ulang, jadi gulir ke atas secara manual dan hapus #anchor dari URL.
 */
export default function LogoLink({ href, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        if (window.location.pathname !== href) return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) history.replaceState(null, "", href);
      }}
    />
  );
}
