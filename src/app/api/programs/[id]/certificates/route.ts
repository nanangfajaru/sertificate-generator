import { NextResponse } from "next/server";
import { Zip, ZipPassThrough } from "fflate";
import { getSessionProfile } from "@/lib/auth";
import { CERT_ZIP_BATCH, type Participant, type Program } from "@/lib/db";
import { loadBackground, ownerIsPro, resolvedFor, signatureImages, withBranding } from "@/lib/certificate/load";
import { renderCertificatePdf } from "@/lib/certificate/pdf";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;


const safe = (s: string) => s.normalize("NFKD").replace(/[^\w\s.-]+/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

/** Unduh massal: ZIP berisi satu PDF per peserta yang disetujui, dikirim bertahap (streaming). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });

  const { data: prog } = await s.supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!prog) return new NextResponse("Not found", { status: 404 });
  const program = prog as Program;

  const part = Math.max(1, Number(new URL(req.url).searchParams.get("part")) || 1);
  const from = (part - 1) * CERT_ZIP_BATCH;
  const { data: rows } = await s.supabase
    .from("participants")
    .select("id, data, cert_number, code, created_at")
    .eq("program_id", id)
    .eq("status", "approved")
    .order("created_at")
    .range(from, from + CERT_ZIP_BATCH - 1);
  const list = (rows ?? []) as Pick<Participant, "id" | "data" | "cert_number" | "code">[];
  if (!list.length) return new NextResponse("Belum ada sertifikat yang terbit.", { status: 404 });

  // Latar, tanda tangan, dan status paket cukup dimuat sekali untuk semua peserta.
  const admin = createAdminClient();
  const [isPro, bg, images] = await Promise.all([ownerIsPro(admin, program.owner_id), loadBackground(admin, program), signatureImages(admin, program)]);
  const nameId = program.mapping?.name;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const zip = new Zip((err, chunk, final) => {
        if (err) return controller.error(err);
        controller.enqueue(chunk);
        if (final) controller.close();
      });
      void (async () => {
        const used = new Set<string>();
        for (const [i, p] of list.entries()) {
          try {
            const bytes = await renderCertificatePdf(withBranding(resolvedFor(program, p, !isPro), program), bg, images);
            const name = safe((nameId && p.data?.[nameId]) || "peserta") || "peserta";
            let file = `${String(from + i + 1).padStart(3, "0")} - ${name}.pdf`;
            if (used.has(file)) file = `${String(from + i + 1).padStart(3, "0")} - ${name} (${p.code}).pdf`;
            used.add(file);
            const entry = new ZipPassThrough(file);
            zip.add(entry);
            entry.push(bytes, true);
          } catch (e) {
            console.error("zip cert", p.id, e);
          }
        }
        zip.end();
      })();
    },
  });

  const base = safe(program.alias || program.slug || "program").replace(/\s+/g, "-") || "program";
  const suffix = part > 1 || list.length === CERT_ZIP_BATCH ? `-bagian-${part}` : "";
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="sertifikat-${base}${suffix}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
