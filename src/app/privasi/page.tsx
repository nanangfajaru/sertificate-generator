import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="14 Oktober 2026">
      <p>Sertifikat Online (sertifikatku.com) membantu penyelenggara kegiatan menerbitkan sertifikat digital. Halaman ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.</p>
      <section>
        <h2>Data yang kami kumpulkan</h2>
        <ul>
          <li><b>Akun penyelenggara:</b> nama, alamat email, dan foto profil (jika masuk dengan Google), serta kata sandi terenkripsi bila mendaftar dengan email.</li>
          <li><b>Data kegiatan:</b> informasi program, formulir pendaftaran, desain sertifikat, dan gambar tanda tangan yang Anda unggah.</li>
          <li><b>Data peserta:</b> isian formulir pendaftaran yang diatur penyelenggara (misalnya nama dan email), yang digunakan untuk menerbitkan sertifikat.</li>
          <li><b>Data pembayaran:</b> pembayaran diproses oleh Midtrans. Kami hanya menyimpan nomor pesanan, paket, nominal, dan statusnya; kami tidak menyimpan nomor kartu atau kredensial pembayaran.</li>
        </ul>
      </section>
      <section>
        <h2>Cara kami menggunakan data</h2>
        <ul>
          <li>Menyediakan layanan: membuat program, menerbitkan dan memverifikasi sertifikat.</li>
          <li>Mengirim email layanan, seperti konfirmasi akun, reset kata sandi, dan tautan sertifikat.</li>
          <li>Memproses pembayaran dan mengaktifkan paket berlangganan.</li>
          <li>Menjaga keamanan dan mencegah penyalahgunaan.</li>
        </ul>
      </section>
      <section>
        <h2>Login dengan Google</h2>
        <p>Jika Anda masuk dengan Google, kami hanya menerima nama, alamat email, dan foto profil Anda. Kami tidak mengakses data Google lainnya.</p>
      </section>
      <section>
        <h2>Berbagi data</h2>
        <p>Kami tidak menjual data pribadi. Data hanya dibagikan kepada penyedia layanan yang diperlukan untuk menjalankan aplikasi (hosting, basis data, pengiriman email, dan pembayaran). Halaman sertifikat dapat dibuka oleh siapa pun yang memiliki tautan atau kode verifikasinya, dan menampilkan nama pemegang serta detail kegiatan.</p>
      </section>
      <section>
        <h2>Penyimpanan dan penghapusan</h2>
        <p>Data disimpan selama akun aktif atau selama diperlukan untuk layanan. Anda dapat meminta penghapusan akun dan data melalui email di bawah ini.</p>
      </section>
      <section>
        <h2>Kontak</h2>
        <p>Pertanyaan tentang privasi dapat dikirim ke <a className="text-brand-700 underline" href="mailto:nanangfajaru@gmail.com">nanangfajaru@gmail.com</a>.</p>
      </section>
    </LegalPage>
  );
}
