import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sampleContext, signatureUrls } from "@/lib/certificate/load";
import type { DesignDTO } from "@/lib/designs";
import { TEMPLATES } from "@/lib/certificate/templates";
import DesignClient from "./DesignClient";

export const metadata = { title: "Sertifikat" };

export default async function DesignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ setup?: string }> }) {
  const { id } = await params;
  const setup = (await searchParams).setup === "1";
  const { program, fields, profile, isPro, supabase } = await getOwnedProgram(id);
  const ctx = sampleContext(program, fields);
  const [images, { data: rows }] = await Promise.all([
    signatureUrls(createAdminClient(), program),
    supabase.from("program_designs").select("id, name, kind, layout, preview_path, updated_at").eq("program_id", id).order("created_at"),
  ]);
  const logoUrl = images.logo ?? null;
  const paths = (rows ?? []).map((r) => r.preview_path);
  const { data: signed } = paths.length ? await createAdminClient().storage.from("designs").createSignedUrls(paths, 3600) : { data: [] };
  const urlByPath = new Map((signed ?? []).map((x) => [x.path, x.signedUrl]));
  const designs: DesignDTO[] = (rows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    layout: r.layout as DesignDTO["layout"],
    previewUrl: urlByPath.get(r.preview_path) ?? null,
    updatedAt: r.updated_at,
  }));

  // Daftar ringan; layout tiap template dihitung di browser (pratinjau memakai data program sebenarnya).
  const templates = TEMPLATES.map((t) => ({ id: t.id, name: t.name, tier: t.tier }));

  return (
    <DesignClient
      setup={setup}
      logoUrl={logoUrl}
      images={images}
      programId={id}
      userId={profile.id}
      isPro={isPro}
      readOnly={program.owner_id !== profile.id}
      mode={program.cert_mode}
      templateId={program.template_id}
      templates={templates}
      designs={designs}
      activeDesignId={program.cert_mode === "custom" ? program.design_id : null}
      sample={ctx}
      fields={fields.map((f) => ({ id: f.id, label: f.label }))}
    />
  );
}
