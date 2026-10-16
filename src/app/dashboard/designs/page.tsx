import { requireUser } from "@/lib/auth";
import { librarySample, type DesignDTO } from "@/lib/designs";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import LibraryClient from "./LibraryClient";

export const metadata = { title: "Desain saya" };

export default async function DesignsPage() {
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
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Desain saya</h1>
        <p className="text-sm text-slate-500">Desain sertifikat buatan sendiri dari Canva, Photoshop, dsb. Buat sekali, lalu pakai di program mana pun lewat tab <b>Sertifikat → Desain sendiri</b>.</p>
      </div>
      <LibraryClient userId={profile.id} isPro={isPro} designs={designs} sample={librarySample(`${siteUrl()}/v/contoh`)} />
    </div>
  );
}
