import LinkCard from "./LinkCard";
import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import { deleteProgram, updateProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";
import DeleteButton from "./DeleteButton";
import CertPreviewCard from "./CertPreviewCard";
import { previewUrl, programLayout, sampleContext, signatureUrls, withBranding } from "@/lib/certificate/load";
import { resolveLayout } from "@/lib/certificate/sources";
import { getTemplate } from "@/lib/certificate/templates";

export const metadata = { title: "Ringkasan program" };

export default async function ProgramOverview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const created = (await searchParams).created === "1";
  const { program, fields, isPro } = await getOwnedProgram(id);
  const admin = createAdminClient();
  const custom = program.cert_mode === "custom" && !!program.design_layout;
  // Semua permintaan berjalan paralel.
  const [images, bgUrl] = await Promise.all([
    signatureUrls(admin, program),
    custom ? previewUrl(admin, program) : Promise.resolve(null),
  ]);
  const logoUrl = images.logo ?? null;
  const sigUrls = [images.sig1 ?? null, images.sig2 ?? null];
  const certLayout = resolveLayout(withBranding(programLayout(program), program, { placeholder: true }), sampleContext(program, fields));

  return (
    <>
    {created && (
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white">✓</span>
        <p className="flex-1"><b>Program siap!</b> Bagikan link atau QR pendaftaran agar peserta mulai mengisi. Logo dan tanda tangan bisa diunggah di bawah.</p>
      </div>
    )}
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ProgramForm action={updateProgram.bind(null, id)} program={program} sigUrls={[sigUrls[0], sigUrls[1]]} logoUrl={logoUrl} submitLabel="Simpan perubahan" />
        <div className="card">
          <h2 className="font-semibold text-red-700">Zona berbahaya</h2>
          {isPro ? (
            <>
              <p className="mt-1 text-xs text-slate-500">Menghapus program juga menghapus seluruh peserta dan tidak dapat dibatalkan.</p>
              <DeleteButton action={deleteProgram.bind(null, id)} />
            </>
          ) : (
            <p className="mt-1 text-xs text-slate-500">Penghapusan program hanya tersedia di paket Pro. Anda dapat menutup pendaftaran kapan saja.</p>
          )}
        </div>
      </div>
      {/* Di HP link pendaftaran & pratinjau tampil lebih dulu daripada formulir panjang. */}
      <div className="order-first space-y-6 lg:order-none">
        <LinkCard programId={id} origin={siteUrl()} slug={program.slug} alias={program.alias} isOpen={program.is_open} fileBase={(program.alias || program.slug).slice(0, 40)} />
        <CertPreviewCard programId={id} templateName={custom ? "Desain sendiri" : getTemplate(program.template_id).name} layout={certLayout} bgUrl={bgUrl} images={images} logoPlaceholder={!images.logo} />
      </div>
    </div>
    </>
  );
}
