import { notFound } from "next/navigation";
import { cache } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import type { Program, ProgramField } from "@/lib/db";
import { formatDateRange } from "@/lib/certificate/sources";
import { createAdminClient } from "@/lib/supabase/admin";
import { findProgramByKey } from "@/lib/program-lookup";
import { mailConfigured } from "@/lib/mailer";
import RegisterForm from "./RegisterForm";

// cache(): metadata dan halaman memakai satu query yang sama dalam satu permintaan.
const loadProgram = cache(async (slug: string) => {
  const admin = createAdminClient();
  const program = await findProgramByKey(admin, slug);
  if (!program) return null;
  const { data: f } = await admin.from("program_fields").select("*").eq("program_id", program.id).order("sort");
  return { program, fields: (f ?? []) as ProgramField[] };
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
  const { program, fields } = loaded;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="card">
          <p className="text-sm font-medium text-brand-700">{program.org_name}</p>
          <h1 className="mt-1 text-2xl font-bold leading-snug">{program.name}</h1>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDateRange(program.start_date, program.end_date)}</p>
            {program.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {program.location}</p>}
          </div>
        </div>

        <div className="card mt-4">
          {program.is_open ? (
            <>
              <h2 className="mb-4 font-semibold">Form pendaftaran</h2>
              <RegisterForm slug={slug} fields={fields.map((x) => ({ id: x.id, label: x.label, type: x.type, required: x.required, options: x.options }))} manual={program.approval_mode === "manual"} emailNotify={program.notify_email && mailConfigured() && fields.some((x) => x.type === "email")} />
            </>
          ) : (
            <p className="text-center text-slate-600">Pendaftaran untuk kegiatan ini sudah ditutup.</p>
          )}
        </div>
      </div>
    </main>
  );
}
