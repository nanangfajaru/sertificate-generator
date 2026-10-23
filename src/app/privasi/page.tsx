import LegalPage from "@/components/LegalPage";
import { legalEmail } from "@/lib/social";

export const metadata = { title: "Kebijakan Privasi", alternates: { canonical: "/privasi" } };

export default async function PrivacyPage() {
  const email = await legalEmail();
  return (
    <LegalPage title="Kebijakan Privasi" updated="21 Oktober 2026">
      <p>SertifikatKu (sertifikatku.com) membantu penyelenggara kegiatan menerbitkan sertifikat digital. Kebijakan ini menjelaskan data pribadi apa yang kami proses, untuk apa, dan hak Anda, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).</p>
      <section>
        <h2>Peran kami</h2>
        <ul>
          <li><b>Data akun penyelenggara, pembayaran, dan pesan kontak:</b> SertifikatKu adalah pengendali data.</li>
          <li><b>Data peserta kegiatan:</b> penyelenggara adalah pengendali data; SertifikatKu memproses data tersebut atas nama dan sesuai instruksi penyelenggara (prosesor data). Pertanyaan atau permintaan peserta terkait datanya sebaiknya diajukan ke penyelenggara kegiatan; kami akan membantu penyelenggara memenuhinya.</li>
        </ul>
      </section>
      <section>
        <h2>Data yang kami kumpulkan</h2>
        <ul>
          <li><b>Akun penyelenggara:</b> nama, alamat email, dan foto profil (jika masuk dengan Google), serta kata sandi terenkripsi bila mendaftar dengan email.</li>
          <li><b>Data kegiatan:</b> informasi program, formulir pendaftaran, desain sertifikat, dan gambar tanda tangan yang Anda unggah.</li>
          <li><b>Data peserta:</b> isian formulir pendaftaran yang diatur penyelenggara (misalnya nama dan email), yang digunakan untuk menerbitkan sertifikat.</li>
          <li><b>Statistik kunjungan:</b> jumlah kunjungan, halaman yang dibuka, asal pengunjung, negara, jenis perangkat, dan kecepatan halaman melalui Vercel Web Analytics dan Speed Insights. Data ini anonim dan tidak dipakai untuk mengenali Anda secara pribadi; kode sertifikat pada alamat halaman disamarkan.</li>
          <li><b>Data pembayaran:</b> pembayaran diproses oleh Midtrans. Kami hanya menyimpan nomor pesanan, paket, nominal, metode dan kode bayar, serta statusnya; kami tidak menyimpan nomor kartu atau kredensial pembayaran.</li>
          <li><b>Pesan kontak:</b> nama, email, instansi, dan isi pesan yang Anda kirim lewat halaman Hubungi Kami.</li>
        </ul>
      </section>
      <section>
        <h2>Tujuan dan dasar pemrosesan</h2>
        <ul>
          <li>Menyediakan layanan yang Anda minta (pelaksanaan perjanjian): membuat program, menerbitkan dan memverifikasi sertifikat.</li>
          <li>Mengirim email layanan, seperti konfirmasi akun, reset kata sandi, tautan sertifikat, dan bukti pembelian.</li>
          <li>Memproses pembayaran, mengaktifkan paket berlangganan, dan menghitung komisi referral.</li>
          <li>Menjaga keamanan, mencegah penyalahgunaan, dan memenuhi kewajiban hukum (kepentingan yang sah dan kewajiban hukum).</li>
          <li>Memahami penggunaan situs secara agregat untuk memperbaiki layanan.</li>
        </ul>
        <p>Kami tidak menjual data pribadi dan tidak memakai data peserta untuk promosi kami.</p>
      </section>
      <section>
        <h2>Login dengan Google</h2>
        <p>Jika Anda masuk dengan Google, kami hanya menerima nama, alamat email, dan foto profil Anda. Kami tidak mengakses data Google lainnya.</p>
      </section>
      <section>
        <h2>Cookie</h2>
        <p>Kami memakai cookie yang diperlukan agar Anda tetap masuk (sesi login) dan cookie sumber kunjungan selama 30 hari untuk mencatat kode referral atau kampanye yang Anda gunakan. Kami tidak memakai cookie iklan atau pelacak pihak ketiga.</p>
      </section>
      <section>
        <h2>Pihak yang memproses data</h2>
        <p>Data hanya dibagikan kepada penyedia layanan yang diperlukan untuk menjalankan aplikasi, dengan kewajiban menjaga kerahasiaannya:</p>
        <ul>
          <li>Supabase (basis data dan penyimpanan berkas), server di Singapura.</li>
          <li>Vercel (hosting aplikasi dan statistik kunjungan), jaringan server global termasuk Amerika Serikat.</li>
          <li>Midtrans (pemrosesan pembayaran), Indonesia.</li>
          <li>Penyedia layanan email untuk mengirim email layanan.</li>
          <li>Google (khusus bila Anda memilih masuk dengan Google).</li>
        </ul>
        <p>Karena sebagian penyedia berada di luar Indonesia, data Anda dapat ditransfer dan disimpan di luar wilayah Indonesia. Kami memilih penyedia yang menerapkan standar pelindungan data yang memadai. Halaman sertifikat dapat dibuka oleh siapa pun yang memiliki tautan atau kode verifikasinya, dan menampilkan nama pemegang serta detail kegiatan.</p>
      </section>
      <section>
        <h2>Keamanan</h2>
        <p>Koneksi dienkripsi (HTTPS), kata sandi disimpan dalam bentuk terenkripsi, dan akses data dibatasi per akun. Bila terjadi kegagalan pelindungan data pribadi, kami akan memberitahu pemilik data yang terdampak dan instansi yang berwenang paling lambat 3 × 24 jam sejak diketahui, sesuai UU PDP.</p>
      </section>
      <section>
        <h2>Penyimpanan dan penghapusan</h2>
        <ul>
          <li>Data akun dan kegiatan disimpan selama akun aktif. Penyelenggara dapat menghapus program dan data pesertanya kapan saja dari dashboard.</li>
          <li>Catatan transaksi disimpan selama diwajibkan peraturan perpajakan dan akuntansi, meskipun akun telah dihapus.</li>
          <li>Pesan kontak disimpan selama diperlukan untuk menindaklanjutinya.</li>
        </ul>
      </section>
      <section>
        <h2>Hak Anda</h2>
        <p>Sesuai UU PDP, Anda berhak mendapat informasi tentang pemrosesan data Anda, mengakses dan memperoleh salinannya, memperbaiki data yang tidak akurat, meminta penghapusan, menarik persetujuan, serta mengajukan keberatan. Ajukan permintaan melalui email di bawah; kami menanggapinya paling lambat 3 × 24 jam dan menyelesaikannya sesuai ketentuan yang berlaku. Untuk data peserta, permintaan akan kami teruskan kepada penyelenggara kegiatan terkait.</p>
      </section>
      <section>
        <h2>Perubahan kebijakan</h2>
        <p>Kebijakan ini dapat diperbarui; tanggal pembaruan tercantum di atas. Perubahan penting akan kami umumkan di aplikasi atau lewat email.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>Pertanyaan atau permintaan terkait data pribadi dapat dikirim ke <a className="text-brand-700 underline" href={`mailto:${email}`}>{email}</a>.</p>
      </section>
    </LegalPage>
  );
}
