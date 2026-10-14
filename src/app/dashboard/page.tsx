import Link from "next/link";
import { BadgeCheck, CalendarDays, ClipboardList, Clock, Crown, FolderOpen, Plus, Sparkles, Users } from "lucide-react";
import TemplateThumb from "./TemplateThumb";
import { requireUser } from "@/lib/auth";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";
import { formatDateRange } from "@/lib/certificate/sources";
import { getTemplate } from "@/lib/certificate/templates";

export const metadata = { title: "Program" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("id-ID", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date()));
  return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
}

export default async function DashboardPage() {
  const { supabase, profile, isPro } = await requireUser();
  const [{ data }, approved, pendingRows] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, org_name, start_date, end_date, approval_mode, is_open, cert_mode, template_id, participants(count)")
      .order("created_at", { ascending: false }),
    supabase.from("participants").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("participants").select("program_id").eq("status", "pending").limit(1000),
  ]);
  const programs = data ?? [];
  const pendingBy = new Map<string, number>();
  pendingRows.data?.forEach((r) => pendingBy.set(r.program_id, (pendingBy.get(r.program_id) ?? 0) + 1));
  const countOf = (p: (typeof programs)[number]) => (p.participants as unknown as { count: number }[])?.[0]?.count ?? 0;
  const totalParticipants = programs.reduce((a, p) => a + countOf(p), 0);
  const pendingTotal = [...pendingBy.values()].reduce((a, b) => a + b, 0);
  const activeCount = programs.filter((p) => p.is_open).length;
  const atLimit = !isPro && programs.length >= FREE_PROGRAM_LIMIT;
  const first = (profile.full_name ?? "").trim().split(/\s+/)[0];
  const usedPct = Math.min(100, Math.round((programs.length / FREE_PROGRAM_LIMIT) * 100));

  const stats = [
    { label: "Program", value: programs.length, icon: FolderOpen, tone: "bg-brand-50 text-brand-700" },
    { label: "Peserta terdaftar", value: totalParticipants, icon: Users, tone: "bg-sky-50 text-sky-700" },
    { label: "Sertifikat terbit", value: approved.count ?? 0, icon: BadgeCheck, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Menunggu persetujuan", value: pendingTotal, icon: Clock, tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-brand-100">{greeting()}{first ? "," : ""}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{first || "Selamat datang"} 👋</h1>
            <p className="mt-2 max-w-md text-sm text-brand-100">
              {programs.length === 0
                ? "Mulai dengan membuat program pertama, lalu bagikan tautan pendaftarannya."
                : pendingTotal > 0
                  ? `Ada ${pendingTotal} peserta yang menunggu persetujuan Anda.`
                  : `${activeCount} program sedang membuka pendaftaran.`}
            </p>
          </div>
          {atLimit ? (
            <span className="btn cursor-not-allowed opacity-70">Batas program Free tercapai</span>
          ) : (
            <Link href="/dashboard/programs/new" className="btn border-white bg-white font-semibold text-brand-700 hover:bg-brand-50">
              <Plus className="h-4 w-4" /> Program baru
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 !p-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {isPro ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 text-sm text-amber-900">
          <Crown className="h-5 w-5 shrink-0 text-amber-600" />
          <p><b>Paket Pro aktif</b> · program tanpa batas, seluruh template bertema, desain sendiri, dan sertifikat tanpa watermark.</p>
        </div>
      ) : (
        <div className="card flex flex-wrap items-center justify-between gap-4 !p-4">
          <div className="min-w-[14rem] flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Paket Free</span>
              <span className="text-slate-500">{programs.length} / {FREE_PROGRAM_LIMIT} program</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${usedPct >= 100 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${usedPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Maksimal {FREE_PARTICIPANT_LIMIT} peserta per program. Upgrade ke Pro untuk program tanpa batas, template bertema, desain sendiri, dan tanpa watermark.</p>
          </div>
          <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Lihat paket Pro</Link>
        </div>
      )}

      {programs.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><ClipboardList className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-semibold">Belum ada program</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Buat program, atur formulir pendaftaran, pilih desain sertifikat, lalu bagikan tautannya ke peserta.</p>
          <Link href="/dashboard/programs/new" className="btn btn-primary mt-5"><Plus className="h-4 w-4" /> Buat program pertama</Link>
        </div>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Program Anda</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => {
              const count = countOf(p);
              const pending = pendingBy.get(p.id) ?? 0;
              const tpl = p.cert_mode === "template" ? getTemplate(p.template_id) : null;
              return (
                <Link key={p.id} href={`/dashboard/programs/${p.id}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md">
                  <div className="relative border-b border-slate-100 bg-slate-100">
                    {tpl ? (
                      <TemplateThumb id={tpl.id} />
                    ) : (
                      <div className="grid aspect-[842/595] place-items-center bg-gradient-to-br from-brand-50 to-slate-100 text-xs text-slate-500">Desain sendiri</div>
                    )}
                    <span className={`badge absolute left-3 top-3 shadow-sm ${p.is_open ? "badge-ok" : "bg-white"}`}>{p.is_open ? "Dibuka" : "Ditutup"}</span>
                    {pending > 0 && <span className="badge badge-warn absolute right-3 top-3 shadow-sm">{pending} menunggu</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug group-hover:text-brand-700">{p.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{p.org_name}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateRange(p.start_date, p.end_date)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {count}{!isPro ? ` / ${FREE_PARTICIPANT_LIMIT}` : ""} peserta</span>
                      <span>{p.approval_mode === "auto" ? "Otomatis" : "Perlu approval"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
