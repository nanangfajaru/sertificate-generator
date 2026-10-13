import { NextResponse } from "next/server";
import type { Participant, Program } from "@/lib/db";
import { loadBackground, ownerIsPro, resolvedFor } from "@/lib/certificate/load";
import { renderCertificatePdf } from "@/lib/certificate/pdf";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[a-z0-9]{6,32}$/.test(code)) return new NextResponse("Not found", { status: 404 });
  const admin = createAdminClient();
  const { data: part } = await admin.from("participants").select("*").eq("code", code).maybeSingle();
  if (part?.status === "revoked") return new NextResponse("Sertifikat ini telah dicabut oleh penyelenggara.", { status: 410 });
  if (!part || part.status !== "approved") return new NextResponse("Not found", { status: 404 });
  const participant = part as Participant;
  const { data: prog } = await admin.from("programs").select("*").eq("id", participant.program_id).single();
  const program = prog as Program;

  const layout = resolvedFor(program, participant, !(await ownerIsPro(admin, program.owner_id)));
  const bytes = await renderCertificatePdf(layout, await loadBackground(admin, program));

  const nameId = program.mapping?.name;
  const who = (nameId && participant.data[nameId]) || "peserta";
  const file = `sertifikat-${who}`.replace(/[^a-z0-9]+/gi, "-").slice(0, 60);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
