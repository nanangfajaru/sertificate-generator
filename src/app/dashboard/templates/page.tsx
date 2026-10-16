import { requireUser } from "@/lib/auth";
import { TEMPLATES } from "@/lib/certificate/templates";
import { librarySample, type DesignDTO } from "@/lib/designs";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import DesignClient from "../programs/[id]/design/DesignClient";

export const metadata = { title: "Template" };

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab === "custom" ? "custom" : "template";
  const { supabase, profile, isPro } = await requireUser();
  const { data: rows } = await supabase
    .from("program_designs")
    .select("id, name, kind, layout, preview_path, updated_at")
    .eq("owner_id", profile.id)
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

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold sm:text-2xl">Template</h1>
        <p className="text-sm text-slate-500">Pilih template bawaan atau desain buatan sendiri, lalu buat program baru dengan sertifikat itu.</p>
      </div>
      <DesignClient
        library
        logoUrl={null}
        images={{}}
        programId=""
        userId={profile.id}
        isPro={isPro}
        mode={tab}
        templateId=""
        templates={TEMPLATES.map((t) => ({ id: t.id, name: t.name, tier: t.tier }))}
        designs={designs}
        activeDesignId={null}
        sample={librarySample(`${siteUrl()}/v/contoh`)}
        fields={[]}
      />
    </div>
  );
}
