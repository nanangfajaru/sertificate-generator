import { notFound } from "next/navigation";
import { BadgeCheck, Clock, Download, XCircle } from "lucide-react";
import CertificateSvg from "@/components/CertificateSvg";
import type { Participant, Program } from "@/lib/db";
import { previewUrl, resolvedFor } from "@/lib/certificate/load";
import { createAdminClient } from "@/lib/supabase/admin";

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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        {participant.status === "approved" ? (
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <CertificateSvg layout={resolvedFor(program, participant)} backgroundUrl={await previewUrl(admin, program)} className="block h-auto w-full" />
            </div>
          </>
        ) : participant.status === "pending" ? (
          <div className="card text-center">
            <Clock className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-3 text-xl font-semibold">Pendaftaran diterima</h1>
            <p className="mt-1 text-sm text-slate-600">Sertifikat untuk <b>{who}</b> menunggu persetujuan penyelenggara. Simpan halaman ini dan buka lagi nanti.</p>
          </div>
        ) : (
          <div className="card text-center">
            <XCircle className="mx-auto h-10 w-10 text-red-500" />
            <h1 className="mt-3 text-xl font-semibold">Pendaftaran tidak disetujui</h1>
            <p className="mt-1 text-sm text-slate-600">Hubungi penyelenggara ({program.org_name}) untuk informasi lebih lanjut.</p>
          </div>
        )}
      </div>
    </main>
  );
}
