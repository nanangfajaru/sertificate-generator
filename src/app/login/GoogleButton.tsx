"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleId = {
  accounts: {
    id: {
      initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; nonce: string; use_fedcm_for_prompt?: boolean }) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    };
  };
};

const safe = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Tombol resmi Google (Google Identity Services): layar persetujuan menampilkan nama aplikasi,
 * bukan alamat Supabase. Token Google diserahkan ke Supabase lewat signInWithIdToken.
 * Tanpa NEXT_PUBLIC_GOOGLE_CLIENT_ID, memakai alur OAuth bawaan Supabase.
 */
export default function GoogleButton({ next }: { next?: string }) {
  if (!CLIENT_ID) return <OAuthButton next={next} />;
  return <GisButton next={next} clientId={CLIENT_ID} />;
}

function GisButton({ next, clientId }: { next?: string; clientId: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const g = (window as unknown as { google?: GoogleId }).google;
    if (!ready || !g || !box.current) return;
    let cancelled = false;
    (async () => {
      const nonce = crypto.randomUUID();
      g.accounts.id.initialize({
        client_id: clientId,
        nonce: await sha256Hex(nonce),
        callback: async ({ credential }) => {
          const { error } = await createClient().auth.signInWithIdToken({ provider: "google", token: credential, nonce });
          if (error) setErr("Login gagal. Silakan coba lagi.");
          else window.location.assign(safe(next));
        },
      });
      if (!cancelled && box.current) {
        g.accounts.id.renderButton(box.current, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "left", locale: "id", width: Math.min(box.current.clientWidth || 320, 400) });
      }
    })();
    return () => { cancelled = true; };
  }, [ready, clientId, next]);

  if (failed) return <OAuthButton next={next} />;
  return (
    <div>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setFailed(true)} />
      <div ref={box} className="flex min-h-[44px] w-full justify-center" />
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  );
}

function OAuthButton({ next }: { next?: string }) {
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    const safeNext = safe(next);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}` },
    });
    if (error) setBusy(false);
  }

  return (
    <button onClick={login} disabled={busy} className="btn w-full py-2.5">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z" />
        <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
      </svg>
      {busy ? "Mengalihkan…" : "Lanjutkan dengan Google"}
    </button>
  );
}
