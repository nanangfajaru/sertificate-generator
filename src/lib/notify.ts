import "server-only";
import { withRole } from "./cert-types";
import { certificateIssuedEmail } from "./email-templates";
import { mailConfigured, sendMail } from "./mailer";
import { createAdminClient } from "./supabase/admin";
import type { Participant, Program, ProgramField } from "./db";
import { siteUrl } from "./util";

export type NotifyResult = { sent: number; skipped: number; failed: number };

/** Email pertama bertipe "Email" pada formulir program, jika ada. */
export function emailFieldOf(fields: Pick<ProgramField, "id" | "type">[]) {
  return fields.find((f) => f.type === "email") ?? null;
}

/**
 * Mengirim email "sertifikat terbit" ke peserta yang berstatus disetujui.
 * Tanpa `force`, peserta yang sudah pernah dikirimi dilewati.
 */
export async function notifyApproved(programId: string, ids: string[], force = false): Promise<NotifyResult> {
  const result: NotifyResult = { sent: 0, skipped: 0, failed: 0 };
  if (!ids.length || !mailConfigured()) return { ...result, skipped: ids.length };

  const admin = createAdminClient();
  const { data: prog } = await admin.from("programs").select("*").eq("id", programId).maybeSingle();
  if (!prog) return result;
  const program = prog as Program;
  const { data: f } = await admin.from("program_fields").select("id, type").eq("program_id", programId);
  const emailField = emailFieldOf((f ?? []) as ProgramField[]);
  if (!emailField) return { ...result, skipped: ids.length };

  const { data: rows } = await admin.from("participants").select("*").eq("program_id", programId).in("id", ids).eq("status", "approved");
  const todo = ((rows ?? []) as Participant[]).filter((p) => (force || !p.emailed_at) && !!p.data[emailField.id]);
  result.skipped = ids.length - todo.length;

  const nameId = program.mapping?.name;
  const sendOne = async (p: Participant) => {
    const to = p.data[emailField.id].trim();
    const mail = certificateIssuedEmail({
      name: (nameId && p.data[nameId]) || null,
      eventName: program.name,
      org: program.org_name,
      certType: withRole(program, p.role).cert_type,
      certNumber: p.cert_number,
      url: `${siteUrl()}/c/${p.code}`,
    });
    await sendMail({ to, ...mail });
    await admin.from("participants").update({ emailed_at: new Date().toISOString() }).eq("id", p.id);
  };

  for (let i = 0; i < todo.length; i += 5) {
    const settled = await Promise.allSettled(todo.slice(i, i + 5).map(sendOne));
    for (const s of settled) {
      if (s.status === "fulfilled") result.sent++;
      else {
        result.failed++;
        console.error("notifyApproved gagal:", s.reason instanceof Error ? s.reason.message : s.reason);
      }
    }
  }
  return result;
}
