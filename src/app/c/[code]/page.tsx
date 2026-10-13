import { notFound } from "next/navigation";
import { BadgeCheck, Download, Mail } from "lucide-react";
import CertificateSvg from "@/components/CertificateSvg";
import type { Participant, Program } from "@/lib/db";
import { previewUrl, resolvedFor } from "@/lib/certificate/load";
import { mailConfigured } from "@/lib/mailer";
import { emailFieldOf } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";
import { PendingCard, RejectedCard, RevokedCard, maskEmail } from "./StatusCards";

export const metadata = { title: "Sertifikat", robots: { index: false } };

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[a-z0-9]{6,32}$/.test(code)) notFound();
  const admin = createAdminClient();
  const { data: part } = await admin.from("participants").select("*").eq("code", code).maybeSingle();
  if (!part) notFound();
  const participant = part as Participant;
  const { data: prog } = await admin.from("programs").select("*").eq("id", participant.program_id).single();
  const program = prog as Program;

  const nameId = program.mapping?.name;
  const who = (nameId && participant.data[nameId]) || "Peserta";

  // Apakah peserta akan menerima email? (opsi program aktif, SMTP siap, dan ada alamat email)
  const { data: f } = await admin.from("program_fields").select("id, type").eq("program_id", program.id);
  const emailField = emailFieldOf((f ?? []) as { id: string; type: "email" }[]);
  const emailValue = emailField ? participant.data[emailField.id]?.trim() : "";
  const maskedEmail = program.notify_email && mailConfigured() && emailValue ? maskEmail(emailValue) : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        {participant.status === "revoked" ? (
          <RevokedCard
            org={program.org_name}
            event={program.name}
            certNumber={participant.cert_number}
            revokedOn={participant.revoked_at ? new Date(participant.revoked_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }) : null}
          />
        ) : participant.status === "approved" ? (
          <>
            <div className="card flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="font-semibold">Sertifikat valid</p>
                  <p className="text-sm text-slate-600">{who} · {program.name}</p>
                  <p className="font-mono text-xs text-slate-500">{participant.cert_number}</p>
                </div>
              </div>
              <a href={`/api/cert/${code}`} className="btn btn-primary"><Download className="h-4 w-4" /> Unduh PDF</a>
            </div>
            {maskedEmail && (
              <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                Tautan sertifikat ini juga dikirim ke email Anda ({maskedEmail}). Periksa folder spam bila belum masuk.
              </p>
            )}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <CertificateSvg layout={resolvedFor(program, participant)} backgroundUrl={await previewUrl(admin, program)} className="block h-auto w-full" />
            </div>
          </>
        ) : participant.status === "pending" ? (
          <PendingCard who={who} event={program.name} maskedEmail={maskedEmail} />
        ) : (
          <RejectedCard org={program.org_name} />
        )}
      </div>
    </main>
  );
}
