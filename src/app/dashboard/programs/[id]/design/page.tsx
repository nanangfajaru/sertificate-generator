import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { previewUrl, sampleContext } from "@/lib/certificate/load";
import { resolveLayout } from "@/lib/certificate/sources";
import { TEMPLATES } from "@/lib/certificate/templates";
import DesignClient from "./DesignClient";

export const metadata = { title: "Sertifikat" };

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, profile, isPro } = await getOwnedProgram(id);
  const ctx = sampleContext(program, fields);
  const bgUrl = program.design_preview_path ? await previewUrl(createAdminClient(), { ...program, cert_mode: "custom" }) : null;

  // Pratinjau tiap template memakai data program yang sebenarnya.
  const templates = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    tier: t.tier,
    layout: resolveLayout(t.layout, ctx),
  }));

  return (
    <DesignClient
      programId={id}
      userId={profile.id}
      isPro={isPro}
      mode={program.cert_mode}
      templateId={program.template_id}
      templates={templates}
      hasDesign={!!program.design_layout && !!bgUrl}
      designLayout={program.design_layout}
      designBgUrl={bgUrl}
      sample={ctx}
      fields={fields.map((f) => ({ id: f.id, label: f.label }))}
    />
  );
}
