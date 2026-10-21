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
    <LegalPage title="Syarat & Ketentuan" updated="21 Oktober 2026">
      <p>Dengan membuat akun atau menggunakan SertifikatKu (sertifikatku.com), Anda menyetujui syarat berikut. Bila Anda mendaftar atas nama lembaga, Anda menyatakan berwenang mewakili lembaga tersebut.</p>
      <section>
        <h2>Layanan</h2>
        <p>SertifikatKu adalah layanan untuk mengumpulkan data peserta, mengelola persetujuan, dan menerbitkan sertifikat digital berformat PDF dengan nomor unik dan QR verifikasi. Kami menyediakan alat; kegiatan dan isi sertifikat sepenuhnya milik dan tanggung jawab penyelenggara.</p>
      </section>
      <section>
        <h2>Akun dan tanggung jawab penyelenggara</h2>
        <ul>
          <li>Anda bertanggung jawab atas keamanan akun dan kebenaran data yang Anda masukkan.</li>
          <li>Anda memastikan kegiatan benar-benar diselenggarakan, dan nama peserta serta isi sertifikat benar dan tidak menyesatkan.</li>
          <li>Anda memiliki hak atas desain, logo, dan tanda tangan yang diunggah, dan telah mendapat izin dari penandatangan.</li>
          <li>Anda bertindak sebagai <b>pengendali data pribadi</b> peserta: Anda menentukan data apa yang dikumpulkan dan untuk apa, menyampaikan tujuannya kepada peserta, serta memperoleh persetujuan yang diperlukan (termasuk dari orang tua/wali bila peserta masih anak). SertifikatKu memproses data tersebut atas nama Anda sebagai <b>prosesor data pribadi</b>, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.</li>
        </ul>
      </section>
      <section>
        <h2>Keabsahan sertifikat</h2>
        <ul>
          <li>Sertifikat yang diterbitkan merupakan dokumen elektronik sebagaimana dimaksud UU Informasi dan Transaksi Elektronik. Gambar tanda tangan pada sertifikat adalah tanda tangan yang diunggah penyelenggara, <b>bukan tanda tangan elektronik tersertifikasi</b> dari Penyelenggara Sertifikasi Elektronik.</li>
          <li>QR dan nomor sertifikat hanya membuktikan bahwa sertifikat tersebut diterbitkan melalui SertifikatKu oleh akun penyelenggara yang tercantum, dan apakah statusnya masih berlaku atau sudah dicabut. Kami tidak memverifikasi kebenaran kegiatan, kehadiran peserta, maupun pengakuan sertifikat oleh instansi tertentu (misalnya angka kredit atau SKP).</li>
          <li>Keabsahan dan isi sertifikat sepenuhnya menjadi tanggung jawab penyelenggara.</li>
        </ul>
      </section>
      <section>
        <h2>Penggunaan yang dilarang</h2>
        <ul>
          <li>Membuat sertifikat untuk kegiatan fiktif, memalsukan atau meniru dokumen resmi, atau mengatasnamakan lembaga tanpa izin.</li>
          <li>Mengunggah konten yang melanggar hukum, hak kekayaan intelektual orang lain, kesusilaan, atau mengandung SARA.</li>
          <li>Penipuan, spam, mengganggu atau mencoba membobol sistem, serta penyalahgunaan kode voucher atau referral.</li>
        </ul>
        <p>Siapa pun dapat melaporkan sertifikat atau konten yang diduga melanggar melalui tautan &ldquo;Laporkan&rdquo; di halaman sertifikat atau halaman <a className="text-brand-700 underline" href="/kontak">Hubungi Kami</a>. Kami dapat menonaktifkan sertifikat, program, atau akun yang melanggar tanpa pengembalian dana, dan menindaklanjuti permintaan pemutusan akses dari instansi yang berwenang sesuai peraturan perundang-undangan.</p>
      </section>
      <section>
        <h2>Paket dan pembayaran</h2>
        <ul>
          <li>Paket <b>Free</b> memiliki batasan jumlah program, peserta, dan template, serta sertifikat diberi watermark.</li>
          <li>Paket <b>Pro</b> tersedia dalam langganan bulanan (harga normal {rp(pricing.monthly.list)}) dan tahunan (harga normal {rp(pricing.yearly.list)}), dan diaktifkan setelah pembayaran berhasil lewat Midtrans. Harga yang dibayar bisa lebih rendah karena promo atau kode voucher yang berlaku, dan selalu ditampilkan sebelum pembayaran.</li>
          <li>Masa aktif Pro berlaku sesuai paket yang dibeli dan <b>tidak diperpanjang otomatis</b>. Anda dapat memperpanjang kapan saja; sisa masa aktif tetap terhitung.</li>
          <li>Pembayaran diproses oleh Midtrans (PT Midtrans). Kami tidak menyimpan data kartu atau kredensial pembayaran Anda.</li>
        </ul>
      </section>
      <section>
        <h2>Pengembalian dana</h2>
        <p>Karena layanan langsung aktif setelah pembayaran, pembayaran yang berhasil pada dasarnya tidak dapat dikembalikan. Pengembalian dana diberikan bila:</p>
        <ul>
          <li>terjadi pembayaran ganda untuk pesanan yang sama;</li>
          <li>pembayaran berhasil tetapi paket Pro tidak aktif dan tidak dapat kami perbaiki; atau</li>
          <li>terjadi kesalahan lain dari pihak kami.</li>
        </ul>
        <p>Ajukan dalam 7 hari sejak pembayaran melalui email di bawah dengan menyertakan nomor pesanan. Pengembalian yang disetujui diproses paling lambat 14 hari kerja ke rekening atau metode pembayaran yang Anda tunjuk.</p>
      </section>
      <section>
        <h2>Program referral</h2>
        <ul>
          <li>Komisi referral dihitung dari pembayaran yang berhasil memakai kode Anda, sesuai persentase yang berlaku saat transaksi.</li>
          <li>Komisi dari transaksi yang dibatalkan, dikembalikan, atau terindikasi penyalahgunaan (misalnya memakai kode sendiri lewat akun lain) dibatalkan.</li>
          <li>Penerima komisi bertanggung jawab atas kewajiban pajak atas penghasilannya; kami dapat memotong pajak bila diwajibkan peraturan.</li>
        </ul>
      </section>
      <section>
        <h2>Pencabutan sertifikat</h2>
        <p>Penyelenggara dapat mencabut sertifikat yang telah diterbitkan. Sertifikat yang dicabut ditandai tidak berlaku pada halaman verifikasinya.</p>
      </section>
      <section>
        <h2>Penghentian akun</h2>
        <p>Anda dapat berhenti menggunakan layanan dan meminta penghapusan akun kapan saja. Kami dapat menangguhkan atau menutup akun yang melanggar syarat ini. Setelah akun dihapus, sertifikat yang pernah diterbitkan tidak lagi dapat diverifikasi.</p>
      </section>
      <section>
        <h2>Batas tanggung jawab</h2>
        <p>Layanan diberikan apa adanya. Kami berupaya menjaga ketersediaan dan keamanan layanan, namun tidak bertanggung jawab atas kerugian tidak langsung akibat penggunaan layanan, gangguan dari penyedia pihak ketiga, atau kesalahan data yang dimasukkan pengguna. Tanggung jawab kami paling banyak sebesar biaya yang Anda bayarkan dalam 12 bulan terakhir.</p>
      </section>
      <section>
        <h2>Hukum yang berlaku</h2>
        <p>Syarat ini tunduk pada hukum Republik Indonesia. Perselisihan diupayakan diselesaikan secara musyawarah terlebih dahulu.</p>
      </section>
      <section>
        <h2>Perubahan</h2>
        <p>Syarat ini dapat diperbarui sewaktu-waktu; tanggal pembaruan tercantum di atas. Perubahan penting akan kami umumkan di aplikasi atau lewat email. Penggunaan layanan setelah perubahan berarti Anda menyetujui syarat yang baru.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>Pertanyaan dapat dikirim ke <a className="text-brand-700 underline" href={`mailto:${email}`}>{email}</a>.</p>
      </section>
    </LegalPage>
  );
}
