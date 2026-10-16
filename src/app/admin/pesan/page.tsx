import { Building2, Mail } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import ListToolbar from "@/components/admin/ListToolbar";
import Pager, { likeTerm, pageOf } from "@/components/admin/Pager";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import StatusSelect from "./StatusSelect";

export const metadata = { title: "Pesan masuk · Admin" };

const SIZE = 20;
type SP = { q?: string; status?: string; page?: string };
type Msg = { id: string; name: string; email: string; org: string | null; topic: string; message: string; status: string; emailed: boolean; created_at: string };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await requireAdmin();
  const page = pageOf(sp.page);
  const term = likeTerm(sp.q);
  let q = createAdminClient()
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (term) q = q.or(`name.ilike.%${term}%,email.ilike.%${term}%,org.ilike.%${term}%,message.ilike.%${term}%`);
  if (sp.status && ["baru", "dibalas", "selesai"].includes(sp.status)) q = q.eq("status", sp.status);
  const { data, count } = await q;
  const rows = (data ?? []) as Msg[];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Pesan masuk</h1>
      <p className="mb-4 text-sm text-slate-500">Isian form Hubungi kami. Balas lewat email pengirim, lalu tandai statusnya.</p>
      <div className="mb-4">
        <ListToolbar placeholder="Cari nama, email, instansi, atau isi pesan…" filters={[{ param: "status", label: "Status", options: [["baru", "Baru"], ["dibalas", "Sudah dibalas"], ["selesai", "Selesai"]] }]} />
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Belum ada pesan.</div>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className={`rounded-xl border bg-white p-4 shadow-sm ${m.status === "baru" ? "border-brand-200" : "border-slate-200"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{m.name} <span className="ml-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{m.topic}</span></p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="select-all">{m.email}</span></span>
                    {m.org && <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />{m.org}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}</span>
                  <StatusSelect id={m.id} status={m.status} />
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{m.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CopyButton text={m.email} label="Salin email" />
                {!m.emailed && <span className="text-xs text-amber-700">Notifikasi email gagal terkirim, pesan hanya tersimpan di sini.</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4"><Pager path="/admin/pesan" params={sp} page={page} total={count ?? 0} size={SIZE} noun="pesan" /></div>
    </div>
  );
}
