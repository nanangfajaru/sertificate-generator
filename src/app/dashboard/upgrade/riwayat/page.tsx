import { redirect } from "next/navigation";

// Alamat lama: riwayat kini halaman utama Berlangganan.
export default function OldHistory() {
  redirect("/dashboard/upgrade");
}
