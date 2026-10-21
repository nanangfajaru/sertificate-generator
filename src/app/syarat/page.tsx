import LegalPage from "@/components/LegalPage";
import { legalEmail } from "@/lib/social";
import { getPricing } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

// Harga diambil dari pengaturan master admin; diperbarui saat admin menyimpan harga (revalidatePath) atau tiap jam.
export const revalidate = 3600;
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export const metadata = { title: "Syarat & Ketentuan" };

export default async function TermsPage() {
  const email = await legalEmail();
  const pricing = await getPricing(createAdminClient());
  return (
    <LegalPage title="Syarat & Ketentuan" updated="14 Oktober 2026">
      <p>Dengan menggunakan SertifikatKu (sertifikatku.com), Anda menyetujui syarat berikut.</p>
      <section>
        <h2>Layanan</h2>
        <p>SertifikatKu adalah layanan untuk mengumpulkan data peserta, mengelola persetujuan, dan menerbitkan sertifikat digital berformat PDF dengan QR verifikasi.</p>
      </section>
      <section>
        <h2>Akun dan tanggung jawab penyelenggara</h2>
        <ul>
          <li>Anda bertanggung jawab atas keamanan akun dan kebenaran data yang Anda masukkan.</li>
          <li>Anda memastikan kegiatan, nama peserta, dan isi sertifikat yang diterbitkan benar dan tidak menyesatkan.</li>
          <li>Anda memiliki hak atas desain, logo, dan tanda tangan yang diunggah, dan telah mendapat izin dari penandatangan.</li>
          <li>Dilarang menggunakan layanan untuk penipuan, pemalsuan dokumen, atau konten yang melanggar hukum.</li>
        </ul>
      </section>
      <section>
        <h2>Paket dan pembayaran</h2>
        <ul>
          <li>Paket <b>Free</b> memiliki batasan jumlah program, peserta, dan template, serta sertifikat diberi watermark.</li>
          <li>Paket <b>Pro</b> tersedia dalam langganan bulanan (harga normal {rp(pricing.monthly.list)}) dan tahunan (harga normal {rp(pricing.yearly.list)}), dan diaktifkan setelah pembayaran berhasil lewat Midtrans. Harga yang dibayar bisa lebih rendah karena promo atau kode voucher yang berlaku, dan selalu ditampilkan sebelum pembayaran.</li>
          <li>Masa aktif Pro berlaku sesuai paket yang dibeli dan tidak diperpanjang otomatis. Anda dapat memperpanjang kapan saja.</li>
          <li>Pembayaran yang sudah berhasil tidak dapat dikembalikan, kecuali terdapat kesalahan dari pihak kami. Hubungi kami untuk bantuan.</li>
        </ul>
      </section>
      <section>
        <h2>Pencabutan sertifikat</h2>
        <p>Penyelenggara dapat mencabut sertifikat yang telah diterbitkan. Sertifikat yang dicabut ditandai tidak berlaku pada halaman verifikasinya.</p>
      </section>
      <section>
        <h2>Batas tanggung jawab</h2>
        <p>Layanan diberikan apa adanya. Kami berupaya menjaga ketersediaan dan keamanan layanan, namun tidak bertanggung jawab atas kerugian tidak langsung akibat penggunaan layanan atau kesalahan data yang dimasukkan pengguna.</p>
      </section>
      <section>
        <h2>Perubahan</h2>
        <p>Syarat ini dapat diperbarui sewaktu-waktu. Penggunaan layanan setelah perubahan berarti Anda menyetujui syarat yang baru.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>Pertanyaan dapat dikirim ke <a className="text-brand-700 underline" href={`mailto:${email}`}>{email}</a>.</p>
      </section>
    </LegalPage>
  );
}
