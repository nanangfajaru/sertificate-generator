import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Crown, LayoutTemplate, Lock, Plus, SearchX, Users } from "lucide-react";
import DashboardHero from "./DashboardHero";
import ProgramToolbar from "./ProgramToolbar";
import TemplateThumb from "./TemplateThumb";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";
import { lockedFromList } from "@/lib/program-lock";
import { formatDateRange } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";

export const metadata = { title: "Program" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("id-ID", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date()));
  return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
}

const PAGE_SIZE = 12;
type SP = { q?: string; status?: string; sort?: string; view?: string; page?: string };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase, profile, isPro } = await requireUser();
  const [{ data }, approved, pendingRows] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, org_name, cert_type, description, location, start_date, end_date, owner_id, approval_mode, is_open, setup_done, cert_chosen, cert_mode, template_id, design_id, logo_path, signer1_name, signer1_title, signer2_name, signer2_title, signer1_sig_path, signer2_sig_path, created_at, participants(count)")
      .order("created_at", { ascending: false }),
    supabase.from("participants").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("participants").select("program_id").eq("status", "pending").limit(1000),
  ]);
  const programs = data ?? [];
  // Paket Free: kuota hanya menghitung peran "Peserta" (pembicara/narasumber dkk. tidak dihitung).
  const { data: pc } = !isPro && programs.length ? await supabase.rpc("peserta_counts", { p_ids: programs.map((p) => p.id) }) : { data: null };
  const quotaBy = new Map(((pc ?? []) as { program_id: string; n: number }[]).map((r) => [r.program_id, Number(r.n)]));
  const quotaOf = (p: (typeof programs)[number]) => quotaBy.get(p.id) ?? 0;
  const pendingBy = new Map<string, number>();
  pendingRows.data?.forEach((r) => pendingBy.set(r.program_id, (pendingBy.get(r.program_id) ?? 0) + 1));
  const countOf = (p: (typeof programs)[number]) => (p.participants as unknown as { count: number }[])?.[0]?.count ?? 0;
  // Draf (wizard belum selesai) dibuka langsung di langkah Formulir & sertifikat.
  const hrefOf = (p: (typeof programs)[number]) => (p.setup_done ? `/dashboard/programs/${p.id}` : `/dashboard/programs/${p.id}/form?setup=1`);
  const totalParticipants = programs.reduce((a, p) => a + countOf(p), 0);
  const pendingTotal = [...pendingBy.values()].reduce((a, b) => a + b, 0);
  const activeCount = programs.filter((p) => p.is_open).length;
  // Pro berakhir & program melebihi batas Free: program yang dibuat paling akhir terkunci.
  const locked = lockedFromList(programs.filter((p) => p.owner_id === profile.id), isPro);
  const atLimit = !isPro && programs.length >= FREE_PROGRAM_LIMIT;
  const first = (profile.full_name ?? "").trim().split(/\s+/)[0];

  // Cari, filter, urutkan, dan potong halaman (satu halaman saja yang pratinjaunya dimuat).
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = ["open", "closed", "pending"].includes(sp.status ?? "") ? (sp.status as string) : "all";
  const sort = ["date", "name", "participants"].includes(sp.sort ?? "") ? (sp.sort as string) : "new";
  const view = sp.view === "table" ? "table" : "card";
  const counts = {
    all: programs.length,
    open: activeCount,
    closed: programs.length - activeCount,
    pending: programs.filter((p) => (pendingBy.get(p.id) ?? 0) > 0).length,
  };
  const filtered = programs.filter((p) => {
    if (q && !`${p.name} ${p.org_name}`.toLowerCase().includes(q)) return false;
    if (status === "open") return p.is_open;
    if (status === "closed") return !p.is_open;
    if (status === "pending") return (pendingBy.get(p.id) ?? 0) > 0;
    return true;
  });
  if (sort === "date") filtered.sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name, "id"));
  else if (sort === "participants") filtered.sort((a, b) => countOf(b) - countOf(a));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (n: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: sp.q, status: sp.status, sort: sp.sort, view: sp.view })) if (v) u.set(k, v);
    if (n > 1) u.set("page", String(n));
    const qs = u.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  // Pratinjau kartu: logo, tanda tangan, dan desain sendiri aktif (hanya untuk halaman ini).
  const admin = createAdminClient();
  const cardPrograms = view === "card" ? shown : [];
  const designIds = cardPrograms.flatMap((p) => (p.cert_mode === "custom" && p.design_id ? [p.design_id] : []));
  const { data: designRows } = designIds.length ? await supabase.from("program_designs").select("id, layout, preview_path").in("id", designIds) : { data: [] };
  const brandPaths = [...new Set(cardPrograms.flatMap((p) => [p.logo_path, p.signer1_sig_path, p.signer2_sig_path]).filter(Boolean) as string[])];
  const previewPaths = (designRows ?? []).map((d) => d.preview_path as string).filter(Boolean);
  const [brandUrls, previewUrls] = await Promise.all([
    brandPaths.length ? admin.storage.from("signatures").createSignedUrls(brandPaths, 3600) : Promise.resolve({ data: [] }),
    previewPaths.length ? admin.storage.from("designs").createSignedUrls(previewPaths, 3600) : Promise.resolve({ data: [] }),
  ]);
  const urlOf = new Map((brandUrls.data ?? []).map((x) => [x.path, x.signedUrl]));
  const previewOf = new Map((previewUrls.data ?? []).map((x) => [x.path, x.signedUrl]));
  const designOf = new Map((designRows ?? []).map((d) => [d.id as string, d]));

  return (
    <div className="space-y-6">
      <DashboardHero greeting={`${greeting()}${first ? `, ${first}` : ""}`} programs={programs.length} programLimit={isPro ? null : FREE_PROGRAM_LIMIT} active={activeCount} participants={totalParticipants} approved={approved.count ?? 0} pending={pendingTotal} atLimit={atLimit} />

      {locked.size > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:px-4">
          <Lock className="hidden h-4 w-4 shrink-0 text-amber-600 sm:block" />
          <p className="min-w-0 flex-1"><b>{locked.size} program terkunci.</b> Paket Pro berakhir dan jumlah program melebihi batas Free ({FREE_PROGRAM_LIMIT}). Program yang dibuat paling akhir dikunci dan pendaftarannya ditutup.</p>
          <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm shrink-0 justify-center"><Crown className="h-4 w-4" /> Perpanjang Pro</Link>
        </div>
      )}

      {programs.length === 0 ? (
        <div className="card flex flex-col items-center py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><ClipboardList className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-semibold">Belum ada program</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Buat program, atur formulir pendaftaran, pilih desain sertifikat, lalu bagikan tautannya ke peserta.</p>
          <Link href="/dashboard/programs/new" className="btn btn-primary mt-5"><Plus className="h-4 w-4" /> Buat program pertama</Link>
        </div>
      ) : (
        <section className="space-y-4">
          <ProgramToolbar counts={counts} />

          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center py-12 text-center">
              <SearchX className="h-8 w-8 text-slate-400" />
              <p className="mt-3 font-medium">Tidak ada program yang cocok</p>
              <Link href="/dashboard" className="mt-2 text-sm text-brand-700 hover:underline">Reset pencarian dan filter</Link>
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-2.5">Program</th><th className="px-4 py-2.5">Tanggal</th><th className="px-4 py-2.5 text-right">Peserta</th><th className="px-4 py-2.5 text-right">Menunggu</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5" /></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((p) => {
                    const pending = pendingBy.get(p.id) ?? 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3"><Link href={hrefOf(p)} className="font-medium text-slate-900 hover:text-brand-700">{p.name}</Link>{locked.has(p.id) ? <span className="badge ml-2 gap-1 bg-slate-800 text-white"><Lock className="h-3 w-3" /> Terkunci</span> : !p.setup_done && <span className="badge badge-warn ml-2">Draf</span>}<p className="text-xs text-slate-500">{p.org_name}</p></td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateRange(p.start_date, p.end_date)}</td>
                        <td className="px-4 py-3 text-right">{isPro ? countOf(p) : <>{quotaOf(p)}<span className="text-slate-400"> / {FREE_PARTICIPANT_LIMIT}</span></>}</td>
                        <td className="px-4 py-3 text-right">{pending > 0 ? <span className="badge badge-warn">{pending}</span> : <span className="text-slate-300">—</span>}</td>
                        <td className="px-4 py-3"><span className={`badge ${p.is_open ? "badge-ok" : ""}`}>{p.is_open ? "Dibuka" : "Ditutup"}</span></td>
                        <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1.5"><Link href={`/dashboard/programs/${p.id}/participants`} className="btn btn-sm">Peserta</Link><Link href={hrefOf(p)} className={`btn btn-sm ${p.setup_done ? "" : "btn-primary"}`}>{p.setup_done ? "Kelola" : "Lanjutkan"}</Link></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => {
                const count = countOf(p);
                const pending = pendingBy.get(p.id) ?? 0;
                const design = p.cert_mode === "custom" && p.design_id ? designOf.get(p.design_id) : undefined;
                const images: Record<string, string> = {};
                for (const [key, path] of [["logo", p.logo_path], ["sig1", p.signer1_sig_path], ["sig2", p.signer2_sig_path]] as const) {
                  const u = path ? urlOf.get(path) : undefined;
                  if (u) images[key] = u;
                }
                return (
                  <Link key={p.id} href={hrefOf(p)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md">
                    <div className="relative border-b border-slate-100 bg-slate-100">
                      {p.cert_chosen === false ? (
                        // Draf yang belum memilih sertifikat: jangan tampilkan template bawaan.
                        <div className="grid aspect-[842/595] place-items-center border-2 border-dashed border-amber-200 bg-amber-50/50 text-center">
                          <span>
                            <LayoutTemplate className="mx-auto h-6 w-6 text-amber-500" />
                            <span className="mt-1.5 block text-xs font-medium text-slate-600">Belum pilih sertifikat</span>
                          </span>
                        </div>
                      ) : p.cert_mode === "template" || design ? (
                        <TemplateThumb
                          program={{ org_name: p.org_name, name: p.name, cert_type: p.cert_type, description: p.description, start_date: p.start_date, end_date: p.end_date, location: p.location, signer1_name: p.signer1_name, signer1_title: p.signer1_title, signer2_name: p.signer2_name, signer2_title: p.signer2_title }}
                          certMode={p.cert_mode}
                          templateId={p.template_id}
                          designLayout={design ? (design.layout as Layout) : null}
                          bgUrl={design ? previewOf.get(design.preview_path as string) ?? null : null}
                          images={images}
                        />
                      ) : (
                        <div className="grid aspect-[842/595] place-items-center bg-gradient-to-br from-brand-50 to-slate-100 text-xs text-slate-500">Desain sendiri</div>
                      )}
                      {locked.has(p.id) ? (
                        <span className="absolute inset-0 grid place-items-center bg-slate-900/55 text-center text-white backdrop-blur-[1px]">
                          <span><Lock className="mx-auto h-6 w-6" /><span className="mt-1 block text-xs font-semibold">Terkunci · Pro berakhir</span></span>
                        </span>
                      ) : p.setup_done ? (
                        <span className={`badge absolute left-3 top-3 shadow-sm ${p.is_open ? "badge-ok" : "bg-white"}`}>{p.is_open ? "Dibuka" : "Ditutup"}</span>
                      ) : (
                        <span className="badge badge-warn absolute left-3 top-3 shadow-sm">Draf · lanjutkan</span>
                      )}
                      {pending > 0 && <span className="badge badge-warn absolute right-3 top-3 shadow-sm">{pending} menunggu</span>}
                    </div>
                    <div className="p-3.5">
                      <h3 className="truncate font-semibold leading-snug group-hover:text-brand-700">{p.name}</h3>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{p.org_name}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateRange(p.start_date, p.end_date)}</span>
                        <span className={`flex items-center gap-1 ${!isPro && quotaOf(p) >= FREE_PARTICIPANT_LIMIT * 0.8 ? "font-medium text-amber-700" : ""}`} title={!isPro ? "Kuota paket Free (peran Peserta)" : undefined}><Users className="h-3.5 w-3.5" /> {isPro ? count : `${quotaOf(p)} / ${FREE_PARTICIPANT_LIMIT}`}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pages > 1 && (
            <nav className="flex flex-col-reverse gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between" aria-label="Halaman">
              <p className="text-center text-xs text-slate-500 sm:text-left sm:text-sm">Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} program</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:gap-1.5">
                {page > 1 ? <Link href={pageHref(page - 1)} className="btn btn-sm" aria-label="Sebelumnya"><ChevronLeft className="h-4 w-4" /><span className="sm:hidden">Sebelumnya</span></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><ChevronLeft className="h-4 w-4" /><span className="sm:hidden">Sebelumnya</span></span>}
                <span className="px-2 text-center font-medium text-slate-600">{page} / {pages}</span>
                {page < pages ? <Link href={pageHref(page + 1)} className="btn btn-sm" aria-label="Berikutnya"><span className="sm:hidden">Berikutnya</span><ChevronRight className="h-4 w-4" /></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><span className="sm:hidden">Berikutnya</span><ChevronRight className="h-4 w-4" /></span>}
              </div>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
