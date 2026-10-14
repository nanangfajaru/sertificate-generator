import { Ban, BadgeCheck, Clock, Download, Users } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { getOwnedProgram } from "@/lib/program-server";
import { mailConfigured } from "@/lib/mailer";
import { siteUrl } from "@/lib/util";
import ParticipantsTable from "./ParticipantsTable";

export const metadata = { title: "Peserta" };

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, supabase } = await getOwnedProgram(id);
  const { data } = await supabase.from("participants").select("*").eq("program_id", id).order("created_at", { ascending: false }).limit(2000);
  const rows = data ?? [];
  const count = (s: string) => (s === "all" ? rows.length : rows.filter((r) => r.status === s).length);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={Users} title="Daftar peserta" hint={`Mode: ${program.approval_mode === "auto" ? "sertifikat terbit otomatis" : "perlu persetujuan"}`} />
        <a href={`/api/programs/${id}/export`} className="btn btn-sm"><Download className="h-4 w-4" /> Unduh kehadiran (CSV)</a>
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
            ? "Email ke peserta belum dapat dikirim: tambahkan field bertipe Email pada tab Form pendaftaran."
            : !smtp
              ? "Email ke peserta belum dapat dikirim: SMTP belum dikonfigurasi di server."
              : "Peserta otomatis menerima email berisi tautan sertifikat saat disetujui.";
        return <p className={`mb-4 rounded-lg border px-3 py-2 text-sm ${tone}`}>{msg}</p>;
      })()}
      <ParticipantsTable programId={id} siteUrl={siteUrl()} fields={fields.map((f) => ({ id: f.id, label: f.label }))} rows={rows} />
    </div>
  );
}
