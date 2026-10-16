import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { previewUrl, programLayout, signatureUrls, withBranding } from "@/lib/certificate/load";
import { getTemplate } from "@/lib/certificate/templates";
import type { DesignDTO } from "@/lib/designs";
import FormBuilder from "./FormBuilder";

export const metadata = { title: "Form pendaftaran" };

export default async function FormPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ setup?: string }> }) {
  const { id } = await params;
  const setup = (await searchParams).setup === "1";
  const { program, fields, isPro, supabase } = await getOwnedProgram(id);
  const initial = fields.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    required: f.required,
    options: (f.options ?? []).join("\n"),
    slot: (program.mapping?.name === f.id ? "name" : program.mapping?.extra === f.id ? "extra" : "") as "" | "name" | "extra",
  }));
  const custom = program.cert_mode === "custom" && !!program.design_layout;
  const admin = createAdminClient();
  const [bgUrl, images, { data: designRows }] = await Promise.all([
    custom ? previewUrl(admin, program) : Promise.resolve(null),
    signatureUrls(admin, program),
    supabase.from("program_designs").select("id, name, kind, layout, preview_path, updated_at").eq("owner_id", program.owner_id).order("created_at"),
  ]);
  // Pustaka desain sendiri untuk popup Ganti sertifikat.
  const paths = (designRows ?? []).map((r) => r.preview_path);
  const { data: signed } = paths.length ? await admin.storage.from("designs").createSignedUrls(paths, 3600) : { data: [] };
  const urlByPath = new Map((signed ?? []).map((x) => [x.path, x.signedUrl]));
  const designs: DesignDTO[] = (designRows ?? []).map((r) => ({ id: r.id, name: r.name, kind: r.kind, layout: r.layout as DesignDTO["layout"], previewUrl: urlByPath.get(r.preview_path) ?? null, updatedAt: r.updated_at }));
  const activeDesign = custom ? designs.find((d) => d.id === program.design_id) : undefined;

  return (
    <FormBuilder
      setup={setup}
      programId={id}
      initial={initial}
      layout={withBranding(programLayout(program), program, { placeholder: true })}
      images={images}
      logoPlaceholder={!images.logo}
      bgUrl={bgUrl}
      custom={custom}
      templateName={custom ? `Desain sendiri${activeDesign ? `: ${activeDesign.name}` : ""}` : getTemplate(program.template_id).name}
      picker={{ isPro, current: { mode: custom ? "custom" : "template", templateId: program.template_id, designId: program.design_id ?? null }, designs }}
      program={{
        org_name: program.org_name,
        name: program.name,
        cert_type: program.cert_type,
        description: program.description,
        start_date: program.start_date,
        end_date: program.end_date,
        location: program.location,
        signer1_name: program.signer1_name,
        signer1_title: program.signer1_title,
        signer2_name: program.signer2_name,
        signer2_title: program.signer2_title,
        mapping: null,
      }}
    />
  );
}
