import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import type { Program, ProgramField } from "@/lib/db";
import { sampleContext, signatureImages, withBranding } from "@/lib/certificate/load";
import { renderCertificatePdf, type Background } from "@/lib/certificate/pdf";
import { resolveLayout } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Contoh PDF dari satu desain tersimpan (khusus Pro: pengguna Free hanya mendesain di layar). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });
  if (!s.isPro) return new NextResponse("Contoh PDF desain sendiri khusus paket Pro.", { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });

  const { data: d } = await s.supabase.from("program_designs").select("program_id, file_path, kind, layout").eq("id", id).maybeSingle();
  if (!d) return new NextResponse("Not found", { status: 404 });
  const { data: prog } = await s.supabase.from("programs").select("*").eq("id", d.program_id).maybeSingle();
  if (!prog) return new NextResponse("Not found", { status: 404 });
  const program = prog as Program;
  const { data: f } = await s.supabase.from("program_fields").select("*").eq("program_id", d.program_id).order("sort");

  const base = d.layout as Layout;
  const resolved = resolveLayout(program.show_qr ? base : { ...base, items: base.items.filter((i) => i.type !== "qr") }, sampleContext(program, (f ?? []) as ProgramField[]));
  const asCustom = { ...program, cert_mode: "custom" as const }; // desain sendiri: logo dipasang lewat elemen di editor
  const layout = withBranding(resolved, asCustom);
  const { data: blob, error } = await createAdminClient().storage.from("designs").download(d.file_path);
  if (error || !blob) return new NextResponse("File desain tidak ditemukan", { status: 404 });
  const bg = { kind: d.kind, bytes: new Uint8Array(await blob.arrayBuffer()) } as Background;

  const bytes = await renderCertificatePdf(layout, bg, await signatureImages(createAdminClient(), program));
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="contoh-desain.pdf"' } });
}
