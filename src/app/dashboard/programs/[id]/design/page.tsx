import { redirect } from "next/navigation";

/** Tab Sertifikat digabung ke Formulir & sertifikat (ganti template lewat popup). */
export default async function DesignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ setup?: string }> }) {
  const { id } = await params;
  const setup = (await searchParams).setup === "1";
  redirect(`/dashboard/programs/${id}/form?${setup ? "setup=1" : "pick=1"}`);
}
