/**
 * Contoh program: dipakai untuk bagian "Dipakai untuk beragam kegiatan" di halaman depan
 * dan sebagai data awal oleh `npm run seed`. Semua nama instansi dan penandatangan fiktif.
 */
export type ShowcaseProgram = {
  key: string;
  category: string;
  name: string;
  org: string;
  certType: string;
  description: string;
  start: string;
  end?: string;
  location: string;
  approval: "auto" | "manual";
  template: string;
  signer1: [string, string];
  signer2?: [string, string];
  participants: number;
};

export const SHOWCASE: ShowcaseProgram[] = [
  { key: "seminar-nasional-teknologi", category: "Seminar", name: "Seminar Nasional Teknologi Pendidikan 2026", org: "Universitas Nusantara Digital", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-03-14", location: "Jakarta", approval: "auto", template: "classic-navy", signer1: ["Dr. Budi Santoso, M.Kom", "Ketua Panitia"], signer2: ["Prof. Siti Aminah, Ph.D", "Dekan Fakultas Teknik"], participants: 24 },
  { key: "workshop-ui-ux", category: "Workshop", name: "Workshop UI/UX Design untuk Pemula", org: "Komunitas Kreator Muda", certType: "Peserta", description: "telah menyelesaikan seluruh sesi dalam kegiatan", start: "2026-02-21", end: "2026-02-22", location: "Bandung", approval: "auto", template: "modern-teal", signer1: ["Rina Kusuma", "Koordinator Komunitas"], participants: 18 },
  { key: "webinar-literasi-digital", category: "Webinar", name: "Webinar Literasi Digital Nasional", org: "Dinas Komunikasi dan Informatika Kota Contoh", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-05-09", location: "Daring", approval: "auto", template: "ribbon-slate", signer1: ["Ir. Hendra Wijaya, M.M.", "Kepala Dinas"], participants: 25 },
  { key: "pelatihan-kepemimpinan", category: "Pelatihan", name: "Pelatihan Kepemimpinan Organisasi", org: "Himpunan Mahasiswa Informatika", certType: "Peserta", description: "telah mengikuti seluruh rangkaian kegiatan", start: "2026-04-04", end: "2026-04-06", location: "Bogor", approval: "manual", template: "corner-navy", signer1: ["Fajar Nugroho", "Ketua Umum"], signer2: ["Dewi Lestari, M.Pd.", "Pembina"], participants: 20 },
  { key: "lomba-karya-tulis", category: "Lomba", name: "Lomba Karya Tulis Ilmiah Tingkat Nasional", org: "Politeknik Cendekia", certType: "Juara 1", description: "atas prestasinya dalam kegiatan", start: "2026-06-18", location: "Surabaya", approval: "manual", template: "seal-navy", signer1: ["Dr. Agus Prasetyo, M.T.", "Direktur"], signer2: ["Maya Anggraini, M.Si.", "Ketua Panitia"], participants: 8 },
  { key: "magang-industri", category: "Magang", name: "Program Magang Industri Batch 3", org: "PT Maju Bersama Teknologi", certType: "Magang", description: "telah menyelesaikan program magang pada", start: "2026-01-05", end: "2026-04-03", location: "Jakarta", approval: "manual", template: "split-indigo", signer1: ["Andika Putra", "Head of Human Capital"], participants: 12 },
  { key: "bimtek-guru", category: "Pelatihan", name: "Bimbingan Teknis Kurikulum bagi Guru", org: "Dinas Pendidikan Kota Contoh", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-07-11", end: "2026-07-12", location: "Yogyakarta", approval: "auto", template: "stripe-forest", signer1: ["Drs. Slamet Riyadi, M.Pd.", "Kepala Dinas Pendidikan"], participants: 25 },
  { key: "kuliah-umum", category: "Kuliah Umum", name: "Kuliah Umum Kecerdasan Buatan", org: "Universitas Nusantara Digital", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-08-20", location: "Semarang", approval: "auto", template: "frame-navy", signer1: ["Prof. Siti Aminah, Ph.D", "Dekan Fakultas Teknik"], participants: 22 },
  { key: "pelatihan-umkm", category: "Pelatihan", name: "Pelatihan Pemasaran Digital untuk UMKM", org: "Yayasan Bina Karya", certType: "Peserta", description: "telah mengikuti pelatihan", start: "2026-03-28", location: "Bekasi", approval: "auto", template: "minimal-forest", signer1: ["Hj. Nurhayati", "Ketua Yayasan"], participants: 19 },
  { key: "bakti-sosial", category: "Kepanitiaan", name: "Bakti Sosial Ramadan Berbagi", org: "Karang Taruna Harapan Jaya", certType: "Panitia", description: "atas kontribusinya sebagai panitia dalam kegiatan", start: "2026-03-08", location: "Depok", approval: "manual", template: "geometric-crimson", signer1: ["Yusuf Maulana", "Ketua Karang Taruna"], participants: 15 },
  { key: "pelatihan-first-aid", category: "Pelatihan", name: "Pelatihan Pertolongan Pertama (First Aid)", org: "Palang Merah Remaja Kota Contoh", certType: "Peserta", description: "telah lulus pelatihan", start: "2026-09-05", location: "Malang", approval: "manual", template: "corner-crimson", signer1: ["dr. Ratna Sari", "Instruktur Utama"], participants: 16 },
  { key: "konferensi-riset", category: "Konferensi", name: "Konferensi Riset dan Inovasi 2026", org: "Institut Sains dan Teknologi Nusantara", certType: "Pemakalah", description: "atas partisipasinya sebagai pemakalah dalam kegiatan", start: "2026-09-24", end: "2026-09-25", location: "Bali", approval: "manual", template: "classic-teal", signer1: ["Prof. Dr. Bambang Hartono", "Ketua Konferensi"], signer2: ["Dr. Laksmi Dewi", "Ketua Panitia"], participants: 14 },
  { key: "bootcamp-data", category: "Bootcamp", name: "Bootcamp Analisis Data", org: "Akademi Data Nusantara", certType: "Lulus", description: "telah dinyatakan lulus dari program", start: "2026-02-02", end: "2026-03-27", location: "Daring", approval: "manual", template: "split-teal", signer1: ["Reza Pratama", "Direktur Akademik"], participants: 17 },
  { key: "pelatihan-k3", category: "Pelatihan", name: "Pelatihan Keselamatan dan Kesehatan Kerja", org: "PT Karya Mandiri Sejahtera", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-05-22", location: "Cikarang", approval: "auto", template: "stripe-navy", signer1: ["Ir. Wahyu Hidayat", "Manajer HSE"], participants: 21 },
  { key: "festival-literasi", category: "Festival", name: "Festival Literasi dan Budaya", org: "Perpustakaan Daerah Kota Contoh", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-10-03", end: "2026-10-04", location: "Solo", approval: "auto", template: "frame-forest", signer1: ["Sri Wahyuni, S.S.", "Kepala Perpustakaan"], participants: 23 },
  { key: "olimpiade-sains", category: "Lomba", name: "Olimpiade Sains Siswa Tingkat Provinsi", org: "SMA Negeri 1 Harapan", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-04-25", location: "Palembang", approval: "auto", template: "ribbon-crimson", signer1: ["Drs. Mulyadi, M.Pd.", "Kepala Sekolah"], signer2: ["Anita Rahma, S.Pd.", "Ketua Panitia"], participants: 25 },
  { key: "pelatihan-bahasa", category: "Pelatihan", name: "Pelatihan Bahasa Inggris Profesional", org: "Lembaga Kursus Cakrawala", certType: "Peserta", description: "telah menyelesaikan pelatihan", start: "2026-06-01", end: "2026-06-30", location: "Medan", approval: "auto", template: "modern-forest", signer1: ["Michael Tanuwijaya, M.A.", "Direktur Lembaga"], participants: 18 },
  { key: "talkshow-karier", category: "Seminar", name: "Talkshow Persiapan Karier Generasi Muda", org: "Pusat Karier Politeknik Cendekia", certType: "Peserta", description: "atas partisipasinya dalam kegiatan", start: "2026-08-08", location: "Makassar", approval: "auto", template: "minimal-violet", signer1: ["Ayu Kartika, M.M.", "Kepala Pusat Karier"], participants: 20 },
  { key: "donor-darah", category: "Kegiatan Sosial", name: "Donor Darah Massal Peduli Sesama", org: "Palang Merah Remaja Kota Contoh", certType: "Relawan", description: "atas partisipasinya sebagai relawan dalam kegiatan", start: "2026-09-13", location: "Tangerang", approval: "manual", template: "stripe-slate", signer1: ["dr. Ratna Sari", "Ketua Pelaksana"], participants: 13 },
  { key: "workshop-fotografi", category: "Workshop", name: "Workshop Fotografi Dasar", org: "Komunitas Foto Nusantara", certType: "Peserta", description: "telah mengikuti workshop", start: "2026-07-26", location: "Denpasar", approval: "auto", template: "corner-forest", signer1: ["Bagus Setiawan", "Ketua Komunitas"], participants: 15 },
];
