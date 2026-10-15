import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { previewUrl, programLayout, signatureUrls, withBranding } from "@/lib/certificate/load";
import { getTemplate } from "@/lib/certificate/templates";
import FormBuilder from "./FormBuilder";

export const metadata = { title: "Form pendaftaran" };

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields } = await getOwnedProgram(id);
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
  const [bgUrl, images] = await Promise.all([custom ? previewUrl(admin, program) : Promise.resolve(null), signatureUrls(admin, program)]);

  return (
    <FormBuilder
      programId={id}
      initial={initial}
      layout={withBranding(programLayout(program), program)}
      images={images}
      bgUrl={bgUrl}
      custom={custom}
      templateName={custom ? "Desain sendiri" : getTemplate(program.template_id).name}
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
