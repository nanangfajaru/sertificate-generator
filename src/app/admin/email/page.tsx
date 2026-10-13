import { requireAdmin } from "@/lib/auth";
import { mailSummary } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";
import TestForm from "./TestForm";

export const metadata = { title: "Email · Admin" };

export default async function EmailAdmin() {
  const { profile } = await requireAdmin();
  const cfg = mailSummary();
  const { data: log } = await createAdminClient().from("auth_email_log").select("id, email, kind, ok, error, created_at").order("created_at", { ascending: false }).limit(15);

  const rows: [string, string][] = [
    ["Status", cfg.configured ? "Lengkap" : "Belum lengkap"],
    ["SMTP_HOST", cfg.host ?? "—"],
    ["SMTP_PORT", cfg.port ? `${cfg.port} (${cfg.secure ? "TLS langsung" : "STARTTLS"})` : "— (bawaan 587)"],
    ["SMTP_USER", cfg.user ?? "—"],
    ["SMTP_PASS", cfg.hasPass ? "terisi" : "kosong"],
    ["SMTP_FROM", cfg.from ?? "—"],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Email sistem</h1>

      <section className="card">
        <h2 className="font-semibold">Konfigurasi SMTP</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[160px_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-slate-500">{k}</dt>
              <dd className="break-all font-mono text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2 className="font-semibold">Uji kirim</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">Memeriksa koneksi dan login SMTP, lalu mengirim email contoh. Jika gagal, pesan error dari server SMTP ditampilkan.</p>
        <TestForm defaultTo={profile.email ?? ""} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Riwayat pengiriman terakhir</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Waktu</th><th className="px-3 py-2">Penerima</th><th className="px-3 py-2">Jenis</th><th className="px-3 py-2">Hasil</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(log ?? []).length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">Belum ada.</td></tr>}
              {(log ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" })}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.kind}</td>
                  <td className="px-3 py-2">
                    {r.ok === true ? <span className="badge badge-ok">Terkirim</span> : r.ok === false ? <span className="break-all font-mono text-xs text-red-700">{r.error}</span> : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
