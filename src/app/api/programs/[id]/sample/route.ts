import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import type { Program, ProgramField } from "@/lib/db";
import { loadBackground, programLayout, sampleContext } from "@/lib/certificate/load";
import { withWatermark } from "@/lib/certificate/watermark";
import { renderCertificatePdf } from "@/lib/certificate/pdf";
import { resolveLayout } from "@/lib/certificate/sources";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });
  const { data } = await s.supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!data) return new NextResponse("Not found", { status: 404 });
  const program = data as Program;
  const { data: f } = await s.supabase.from("program_fields").select("*").eq("program_id", id).order("sort");

  const resolved = resolveLayout(programLayout(program), sampleContext(program, (f ?? []) as ProgramField[]));
  const layout = s.isPro ? resolved : withWatermark(resolved);
  const bytes = await renderCertificatePdf(layout, await loadBackground(createAdminClient(), program));
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="contoh-sertifikat.pdf"' },
  });
}
