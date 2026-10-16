import { redirect } from "next/navigation";

/** Alamat lama: pustaka desain kini bagian dari halaman Template. */
export default function DesignsPage() {
  redirect("/dashboard/templates?tab=custom");
}
