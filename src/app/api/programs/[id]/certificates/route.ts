import { NextResponse } from "next/server";
import { Zip, ZipPassThrough } from "fflate";
import { getSessionProfile } from "@/lib/auth";
import { CERT_ZIP_BATCH, type Participant, type Program } from "@/lib/db";
import { loadBackground, ownerIsPro, resolvedFor, signatureImages, withBranding } from "@/lib/certificate/load";
import { certFileName, contentDisposition, safeFileName } from "@/lib/util";
import { renderCertificatePdf } from "@/lib/certificate/pdf";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;


/** Unduh semua (GET, per bagian ?part=N): ZIP berisi satu PDF per peserta yang disetujui. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const part = Math.max(1, Number(new URL(req.url).searchParams.get("part")) || 1);
  return zipResponse(id, { part });
}

/** Unduh peserta terpilih (POST form, field `ids` dipisah koma; maks CERT_ZIP_BATCH). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData().catch(() => null);
  const ids = String(form?.get("ids") ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/.test(x));
  if (!ids.length) return new NextResponse("Pilih peserta terlebih dahulu.", { status: 400 });
  if (ids.length > CERT_ZIP_BATCH) return new NextResponse(`Maksimal ${CERT_ZIP_BATCH} sertifikat sekali unduh.`, { status: 400 });
  return zipResponse(id, { ids });
}

/** ZIP satu PDF per peserta, dikirim bertahap (streaming) agar unduhan langsung berjalan. */
async function zipResponse(id: string, opt: { part?: number; ids?: string[] }) {
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });

  const { data: prog } = await s.supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!prog) return new NextResponse("Not found", { status: 404 });
  const program = prog as Program;

  const part = opt.part ?? 1;
  const from = opt.ids ? 0 : (part - 1) * CERT_ZIP_BATCH;
  let query = s.supabase.from("participants").select("id, data, cert_number, code, role, created_at").eq("program_id", id).eq("status", "approved").order("created_at");
  query = opt.ids ? query.in("id", opt.ids) : query.range(from, from + CERT_ZIP_BATCH - 1);
  const { data: rows } = await query;
  const list = (rows ?? []) as Pick<Participant, "id" | "data" | "cert_number" | "code" | "role">[];
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
            const base = certFileName(program.name, String((nameId && p.data?.[nameId]) || "Peserta"));
            // Nama sama dalam satu ZIP diberi nomor (2), (3), ...
            let file = `${base}.pdf`;
            for (let n = 2; used.has(file.toLowerCase()); n++) file = `${base} (${n}).pdf`;
            used.add(file.toLowerCase());
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

  const suffix = opt.ids ? ` (${list.length} terpilih)` : part > 1 || list.length === CERT_ZIP_BATCH ? ` (bagian ${part})` : "";
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": contentDisposition(`${safeFileName(program.name) || "Sertifikat"} - Sertifikat${suffix}.zip`),
      "Cache-Control": "no-store",
    },
  });
}
