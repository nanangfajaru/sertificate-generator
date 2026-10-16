import { Ban, BadgeCheck, Clock, Download, FileArchive, Users } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { getOwnedProgram } from "@/lib/program-server";
import { mailConfigured } from "@/lib/mailer";
import { siteUrl } from "@/lib/util";
import ParticipantsTable from "./ParticipantsTable";
import ImportDialog from "./ImportDialog";
import AddManualDialog from "./AddManualDialog";
import { DEFAULT_ROLE } from "@/lib/cert-types";
import { CERT_ZIP_BATCH, FREE_PARTICIPANT_LIMIT } from "@/lib/db";

export const metadata = { title: "Peserta" };

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, supabase, isPro, profile } = await getOwnedProgram(id);
  const { data } = await supabase.from("participants").select("*").eq("program_id", id).order("created_at", { ascending: false }).limit(2000);
  const rows = data ?? [];
  const count = (s: string) => (s === "all" ? rows.length : rows.filter((r) => r.status === s).length);
  // Unduh semua sertifikat (ZIP, 1 PDF per peserta); dibagi per CERT_ZIP_BATCH agar tiap unduhan tidak terlalu lama.
  const approved = count("approved");
  const parts = Math.ceil(approved / CERT_ZIP_BATCH);
  const zipHref = (n: number) => `/api/programs/${id}/certificates${n > 1 ? `?part=${n}` : ""}`;
  return (
    <div>
      <div className="mb-5">
        <SectionTitle icon={Users} title="Daftar peserta" hint={`Mode: ${program.approval_mode === "auto" ? "sertifikat terbit otomatis" : "perlu persetujuan"}`} />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total", count("all"), Users, "bg-brand-50 text-brand-700"],
          ["Menunggu", count("pending"), Clock, "bg-amber-50 text-amber-700"],
          ["Disetujui", count("approved"), BadgeCheck, "bg-emerald-50 text-emerald-700"],
          ["Ditolak / dicabut", count("rejected") + count("revoked"), Ban, "bg-slate-100 text-slate-600"],
        ].map(([l, v, Icon, tone]) => {
          const I = Icon as typeof Users;
          return (
            <div key={l as string} className="card flex items-center gap-3 !p-3.5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><I className="h-5 w-5" /></span>
              <div><p className="text-xl font-bold leading-none">{v as number}</p><p className="mt-1 text-xs text-slate-500">{l as string}</p></div>
            </div>
          );
        })}
      </div>
      {(() => {
        const hasEmail = fields.some((f) => f.type === "email");
        const smtp = mailConfigured();
        const tone = program.notify_email && hasEmail && smtp ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900";
        const msg = !program.notify_email
          ? "Email otomatis ke peserta dinonaktifkan. Aktifkan di tab Ringkasan."
          : !hasEmail
            ? "Email ke peserta belum dapat dikirim: tambahkan field bertipe Email pada tab Formulir & sertifikat."
            : !smtp
              ? "Email ke peserta belum dapat dikirim: SMTP belum dikonfigurasi di server."
              : "Peserta otomatis menerima email berisi tautan sertifikat saat disetujui.";
        return <p className={`mb-4 rounded-lg border px-3 py-2 text-sm ${tone}`}>{msg}</p>;
      })()}
      {/* Bar aksi: di bawah ringkasan, tepat di atas tabel */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <ImportDialog
            programId={id}
            fields={fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required, options: f.options ?? [] }))}
            nameId={program.mapping?.name ?? null}
            manual={program.approval_mode === "manual"}
            emailOn={program.notify_email && mailConfigured() && fields.some((f) => f.type === "email")}
            freeLeft={isPro ? null : Math.max(0, FREE_PARTICIPANT_LIMIT - rows.filter((r) => (r.role ?? DEFAULT_ROLE) === DEFAULT_ROLE).length)}
          />
          {program.owner_id === profile.id && (
            <AddManualDialog
              programId={id}
              fields={fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required, options: f.options ?? [] }))}
              nameId={program.mapping?.name ?? null}
              emailOn={mailConfigured() && fields.some((f) => f.type === "email")}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {approved === 0 ? (
            <span className="btn btn-sm cursor-not-allowed opacity-50" title="Belum ada sertifikat yang terbit"><FileArchive className="h-4 w-4" /> Unduh semua sertifikat (ZIP)</span>
          ) : parts <= 1 ? (
            <a href={zipHref(1)} className="btn btn-sm" title="Satu file PDF per peserta yang disetujui"><FileArchive className="h-4 w-4" /> Unduh semua sertifikat (ZIP)</a>
          ) : (
            <details className="relative">
              <summary className="btn btn-sm cursor-pointer list-none"><FileArchive className="h-4 w-4" /> Unduh semua sertifikat (ZIP)</summary>
              <div className="absolute right-0 z-20 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <p className="px-2 py-1 text-xs text-slate-500">{approved} sertifikat, dibagi per {CERT_ZIP_BATCH}:</p>
                {Array.from({ length: parts }, (_, i) => (
                  <a key={i} href={zipHref(i + 1)} className="block rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    Bagian {i + 1} <span className="text-slate-400">({i * CERT_ZIP_BATCH + 1}–{Math.min(approved, (i + 1) * CERT_ZIP_BATCH)})</span>
                  </a>
                ))}
              </div>
            </details>
          )}
          <a href={`/api/programs/${id}/export`} className="btn btn-sm"><Download className="h-4 w-4" /> Unduh kehadiran (CSV)</a>
        </div>
      </div>
      <ParticipantsTable programId={id} siteUrl={siteUrl()} fields={fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required, options: f.options ?? [] }))} rows={rows} nameId={program.mapping?.name ?? null} canEdit={program.owner_id === profile.id} />
    </div>
  );
}
