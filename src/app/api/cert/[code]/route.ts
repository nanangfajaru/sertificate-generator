import { NextResponse } from "next/server";
import type { Participant, Program } from "@/lib/db";
import { loadBackground, resolvedFor, signatureImages, withBranding } from "@/lib/certificate/load";
import { certFileName, contentDisposition } from "@/lib/util";
import { renderCertificatePdf } from "@/lib/certificate/pdf";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[a-z0-9]{6,32}$/.test(code)) return new NextResponse("Not found", { status: 404 });
  const admin = createAdminClient();
  const { data: part } = await admin.from("participants").select("*, program:programs(*)").eq("code", code).maybeSingle();
  if (part?.status === "revoked") return new NextResponse("Sertifikat ini telah dicabut oleh penyelenggara.", { status: 410 });
  if (!part || part.status !== "approved") return new NextResponse("Not found", { status: 404 });
  const { program, ...rest } = part as Participant & { program: Program };
  const participant = rest as Participant;

  // Status paket pemilik, latar desain, dan tanda tangan diambil bersamaan.
  const [bg, images] = await Promise.all([loadBackground(admin, program), signatureImages(admin, program)]);
  const layout = withBranding(resolvedFor(program, participant), program);
  const bytes = await renderCertificatePdf(layout, bg, images);

  const nameId = program.mapping?.name;
  const who = (nameId && participant.data[nameId]) || "peserta";
  const file = `${certFileName(program.name, String(who))}.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(file),
      "Cache-Control": "private, max-age=300",
    },
  });
}
