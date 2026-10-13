import "server-only";
import { after } from "next/server";
import { createAdminClient } from "./supabase/admin";
import type { Program } from "./db";
import { mailConfigured } from "./mailer";
import { notifyApproved } from "./notify";
import { formatCertNumber } from "./util";

/** Menyetujui peserta dan memberi nomor sertifikat berurutan. Dipakai juga oleh form publik (mode auto). */
export async function approveParticipants(program: Pick<Program, "id" | "number_format" | "notify_email">, ids: string[]) {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("participants")
    .select("id, cert_number, approved_at")
    .eq("program_id", program.id)
    .in("id", ids)
    .order("created_at");
  const approvedIds: string[] = [];
  for (const r of rows ?? []) {
    let cert_number = r.cert_number as string | null;
    if (!cert_number) {
      const { data: seq } = await admin.rpc("next_cert_seq", { p_program: program.id });
      cert_number = formatCertNumber(program.number_format, Number(seq));
    }
    await admin.from("participants").update({ status: "approved", cert_number, approved_at: r.approved_at ?? new Date().toISOString(), revoked_at: null, revoked_reason: null }).eq("id", r.id);
    approvedIds.push(r.id);
  }

  // Kirim email "sertifikat terbit" setelah respons selesai, agar persetujuan massal tetap cepat.
  if (program.notify_email && mailConfigured() && approvedIds.length) {
    after(() => notifyApproved(program.id, approvedIds).then(() => undefined, (e) => console.error("notify gagal:", e)));
  }
}
