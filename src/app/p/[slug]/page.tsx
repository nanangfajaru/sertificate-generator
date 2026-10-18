import { notFound } from "next/navigation";
import { cache } from "react";
import type { Program, ProgramField } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { findProgramByKey } from "@/lib/program-lookup";
import { isProgramLocked } from "@/lib/program-lock";
import { mailConfigured } from "@/lib/mailer";
import RegisterView from "./RegisterView";

// cache(): metadata dan halaman memakai satu query yang sama dalam satu permintaan.
const loadProgram = cache(async (slug: string) => {
  const admin = createAdminClient();
  const program = await findProgramByKey(admin, slug);
  if (!program) return null;
  const [{ data: f }, logo, locked] = await Promise.all([
    admin.from("program_fields").select("*").eq("program_id", program.id).order("sort"),
    program.logo_path ? admin.storage.from("signatures").createSignedUrl(program.logo_path, 3600).then((r) => r.data?.signedUrl ?? null) : Promise.resolve(null),
    isProgramLocked(admin, program),
  ]);
  return { program, fields: (f ?? []) as ProgramField[], logo, locked };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = (await loadProgram(slug))?.program;
  return { title: data ? `Daftar – ${data.name}` : "Pendaftaran" };
}

export default async function PublicRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadProgram(slug);
  if (!loaded) notFound();
  const { program, fields, logo, locked } = loaded;

  return (
    <RegisterView
      slug={slug}
      program={program}
      fields={fields.map((x) => ({ id: x.id, label: x.label, type: x.type, required: x.required, options: x.options }))}
      nameId={program.mapping?.name ?? null}
      logo={logo}
      open={program.is_open && !locked}
      emailNotify={program.notify_email && mailConfigured() && fields.some((x) => x.type === "email")}
    />
  );
}
