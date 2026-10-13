import { getOwnedProgram } from "@/lib/program-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sampleContext } from "@/lib/certificate/load";
import type { DesignDTO } from "@/lib/designs";
import { resolveLayout } from "@/lib/certificate/sources";
import { TEMPLATES } from "@/lib/certificate/templates";
import DesignClient from "./DesignClient";

export const metadata = { title: "Sertifikat" };

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, profile, isPro, supabase } = await getOwnedProgram(id);
  const ctx = sampleContext(program, fields);
  const { data: rows } = await supabase
    .from("program_designs")
    .select("id, name, kind, layout, preview_path, updated_at")
    .eq("program_id", id)
    .order("created_at");
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
      designs={designs}
      activeDesignId={program.cert_mode === "custom" ? program.design_id : null}
      sample={ctx}
      fields={fields.map((f) => ({ id: f.id, label: f.label }))}
    />
  );
}
