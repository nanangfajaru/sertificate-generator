import { Download } from "lucide-react";
import { getOwnedProgram } from "@/lib/program-server";
import { mailConfigured } from "@/lib/mailer";
import { siteUrl } from "@/lib/util";
import ParticipantsTable from "./ParticipantsTable";

export const metadata = { title: "Peserta" };

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, supabase } = await getOwnedProgram(id);
  const { data } = await supabase.from("participants").select("*").eq("program_id", id).order("created_at", { ascending: false }).limit(2000);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Mode: <b>{program.approval_mode === "auto" ? "Sertifikat terbit otomatis" : "Perlu approval"}</b>
        </p>
        <a href={`/api/programs/${id}/export`} className="btn btn-sm"><Download className="h-4 w-4" /> Unduh kehadiran (CSV)</a>
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
      <ParticipantsTable programId={id} siteUrl={siteUrl()} fields={fields.map((f) => ({ id: f.id, label: f.label }))} rows={data ?? []} />
    </div>
  );
}
