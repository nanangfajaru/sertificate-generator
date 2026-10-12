import { getOwnedProgram } from "@/lib/program-server";
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
  return <FormBuilder programId={id} initial={initial} />;
}
