export type SeoPage = {
  slug: string;
  title: string; // <title> & H1
  keyword: string;
  intro: string;
  who: string;
  contents: string[]; // isi yang lazim ada pada sertifikat
  tips: string[];
  templates: [string, string];
  sampleEvent: { name: string; certType: string };
  faq: [string, string][];
};

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "seminar",
    title: "Sertifikat Seminar Otomatis",
    keyword: "sertifikat seminar",
    intro: "Peserta seminar mengisi daftar hadir lewat satu tautan, lalu sertifikat PDF dengan QR verifikasi langsung bisa diunduh. Panitia tidak perlu lagi mengetik nama satu per satu.",
    who: "Panitia seminar kampus, himpunan mahasiswa, dan penyelenggara seminar nasional.",
    contents: ["Nama peserta dan jenis sertifikat (peserta, pembicara, moderator)", "Nama dan tanggal seminar, serta lokasi", "Nomor sertifikat berurutan", "Tanda tangan ketua panitia dan dekan/pimpinan", "QR code untuk memverifikasi keaslian"],
    tips: ["Gunakan mode persetujuan jika sertifikat hanya untuk peserta yang benar-benar hadir.", "Cetak QR link pendaftaran di layar atau poster acara agar peserta mengisi saat hadir.", "Unggah gambar tanda tangan agar sertifikat tampak resmi."],
    templates: ["classic-navy", "frame-crimson"],
    sampleEvent: { name: "Seminar Nasional Teknologi 2026", certType: "Peserta" },
    faq: [["Apakah sertifikat seminar bisa memakai nomor otomatis?", "Ya. Format nomor dapat diatur, misalnya 001/SEM/X/2026, dan bertambah otomatis untuk setiap sertifikat."], ["Bagaimana peserta mendapatkan sertifikatnya?", "Setelah mengisi formulir, peserta langsung melihat halaman sertifikat dan dapat mengunduh PDF. Tautan juga bisa dikirim ke email peserta."]],
  },
  {
    slug: "webinar",
    title: "Sertifikat Webinar Online",
    keyword: "sertifikat webinar",
    intro: "Bagikan satu link di chat Zoom atau grup WhatsApp, dan peserta webinar bisa mengambil sertifikat sendiri setelah mengisi data. Cocok untuk webinar dengan ratusan peserta.",
    who: "Penyelenggara webinar, komunitas, dan lembaga edukasi.",
    contents: ["Nama peserta dan nama webinar", "Tanggal pelaksanaan", "Nomor sertifikat unik", "Tanda tangan penyelenggara", "QR verifikasi untuk mencegah pemalsuan"],
    tips: ["Tempel link formulir di chat saat sesi penutup agar semua peserta mengisi bersamaan.", "Aktifkan pengiriman email agar peserta menerima tautan sertifikat.", "Tutup pendaftaran setelah batas waktu agar data tetap rapi."],
    templates: ["modern-teal", "company-modern"],
    sampleEvent: { name: "Webinar Strategi Karier di Era Digital", certType: "Peserta" },
    faq: [["Apakah cocok untuk webinar dengan ribuan peserta?", "Ya. Peserta mengambil sertifikat sendiri tanpa menunggu panitia, sehingga beban admin tetap ringan."], ["Bisakah memakai desain sendiri?", "Bisa. Paket Pro memungkinkan Anda mengunggah desain sertifikat sendiri dan mengatur posisi nama serta data lainnya."]],
  },
  {
    slug: "workshop",
    title: "Sertifikat Workshop & Pelatihan",
    keyword: "sertifikat workshop",
    intro: "Terbitkan sertifikat workshop untuk peserta, instruktur, dan panitia dari satu program. Setiap sertifikat memiliki nomor dan QR yang bisa diperiksa siapa pun.",
    who: "Penyelenggara workshop, bootcamp, dan kelas komunitas.",
    contents: ["Nama peserta dan jenis (peserta, instruktur, panitia)", "Judul workshop, tanggal, dan lokasi", "Nomor sertifikat", "Tanda tangan instruktur atau direktur", "QR verifikasi"],
    tips: ["Buat satu program per sesi agar nomor sertifikat tertata.", "Gunakan jenis sertifikat berbeda untuk instruktur dan panitia.", "Unduh data kehadiran dalam CSV sebagai arsip."],
    templates: ["split-indigo", "flora-leaf"],
    sampleEvent: { name: "Workshop UI/UX Design untuk Pemula", certType: "Peserta" },
    faq: [["Bisakah satu workshop punya beberapa jenis sertifikat?", "Bisa. Anda dapat membuat program terpisah untuk peserta, instruktur, dan panitia dengan template yang sama."], ["Apakah data peserta bisa diunduh?", "Ya, daftar kehadiran dapat diunduh dalam format CSV kapan saja."]],
  },
  {
    slug: "pelatihan",
    title: "Sertifikat Pelatihan & Kursus",
    keyword: "sertifikat pelatihan",
    intro: "Lembaga pelatihan dan kursus dapat menerbitkan sertifikat kelulusan dengan nomor resmi dan QR verifikasi, lalu membagikannya ke ratusan peserta tanpa kerja manual.",
    who: "Lembaga pelatihan, kursus, dan balai latihan kerja.",
    contents: ["Nama peserta dan status kelulusan", "Nama program pelatihan dan periode", "Nomor sertifikat resmi", "Tanda tangan direktur dan instruktur", "QR verifikasi keaslian"],
    tips: ["Gunakan mode persetujuan agar sertifikat hanya terbit untuk peserta yang lulus.", "Cabut sertifikat bila terjadi kesalahan; halaman verifikasi akan menandainya tidak berlaku.", "Pakai template resmi dengan logo lembaga melalui desain sendiri (Pro)."],
    templates: ["seal-navy", "edu-graduate"],
    sampleEvent: { name: "Pelatihan Administrasi Perkantoran", certType: "Lulus" },
    faq: [["Bagaimana jika sertifikat perlu dibatalkan?", "Panitia dapat mencabutnya. Halaman verifikasi akan menampilkan status tidak berlaku."], ["Apakah nomor sertifikat bisa mengikuti format lembaga?", "Bisa. Format nomor dapat diatur sesuai kebutuhan, misalnya {no}/LPK/{bulan}/{tahun}."]],
  },
  {
    slug: "lomba",
    title: "Sertifikat Lomba & Juara",
    keyword: "sertifikat lomba",
    intro: "Buat sertifikat peserta, juara 1, 2, 3, dan juri untuk lomba atau kompetisi. Setiap sertifikat unik dan dapat diverifikasi lewat QR.",
    who: "Panitia lomba, kompetisi, dan olimpiade.",
    contents: ["Nama peserta atau tim", "Predikat (Juara 1, 2, 3, peserta, juri)", "Nama lomba dan tanggal", "Nomor sertifikat", "QR verifikasi"],
    tips: ["Buat program terpisah untuk juara agar hanya pemenang yang menerima sertifikat prestasi.", "Pilih template bertema olahraga atau e-sport untuk kesan kompetisi.", "Bagikan link khusus untuk juri dan panitia."],
    templates: ["sport-medal", "sport-futsal"],
    sampleEvent: { name: "Kejuaraan Futsal Antar Kampus 2026", certType: "Juara 1" },
    faq: [["Apakah tersedia template bertema olahraga?", "Ya. Tersedia template futsal, sepak bola, basket, bulu tangkis, renang, e-sport, dan medali pada paket Pro."], ["Bagaimana membedakan peserta dan juara?", "Buat program terpisah untuk tiap jenis sertifikat sehingga nomor dan penerimanya tertata."]],
  },
  {
    slug: "organisasi",
    title: "Sertifikat Kepanitiaan & Organisasi",
    keyword: "sertifikat panitia",
    intro: "Berikan apresiasi kepada panitia, relawan, dan pengurus organisasi dengan sertifikat resmi yang dapat diverifikasi, tanpa perlu membuatnya satu per satu.",
    who: "BEM, himpunan, UKM, komunitas, dan organisasi kepemudaan.",
    contents: ["Nama panitia atau relawan", "Peran (ketua, anggota, relawan)", "Nama kegiatan dan periode", "Nomor sertifikat", "Tanda tangan ketua dan pembina"],
    tips: ["Kumpulkan nama dan peran lewat formulir sehingga data tidak salah ketik.", "Tambahkan kolom peran dan tampilkan sebagai keterangan tambahan di sertifikat.", "Simpan tanda tangan sebagai gambar PNG transparan."],
    templates: ["batik-kawung", "corner-forest"],
    sampleEvent: { name: "Kepanitiaan Dies Natalis ke-20", certType: "Panitia" },
    faq: [["Bisakah mencantumkan peran panitia di sertifikat?", "Bisa. Tambahkan kolom peran di formulir dan petakan sebagai keterangan tambahan."], ["Apakah gratis?", "Paket Free mencakup 10 program dan 100 peserta per program, cocok untuk sebagian besar kepanitiaan."]],
  },
  {
    slug: "magang",
    title: "Sertifikat Magang & Kelulusan",
    keyword: "sertifikat magang",
    intro: "Terbitkan sertifikat magang atau kelulusan untuk peserta program dengan nomor resmi dan QR, sehingga pihak ketiga dapat memeriksa keasliannya.",
    who: "Perusahaan, startup, dan lembaga yang menerima peserta magang.",
    contents: ["Nama peserta magang", "Posisi dan periode magang", "Nama perusahaan atau lembaga", "Nomor sertifikat", "Tanda tangan pimpinan dan QR verifikasi"],
    tips: ["Gunakan template korporat dengan nuansa profesional.", "Unggah logo dan tanda tangan melalui desain sendiri (Pro).", "Gunakan mode persetujuan agar HR memeriksa sebelum sertifikat terbit."],
    templates: ["company-skyline", "company-tech"],
    sampleEvent: { name: "Program Magang Merdeka Batch 3", certType: "Magang" },
    faq: [["Apakah pihak lain bisa memverifikasi sertifikat?", "Ya. Setiap sertifikat punya QR dan halaman verifikasi publik yang menampilkan status keasliannya."], ["Bisakah memakai logo perusahaan?", "Bisa, dengan mengunggah desain sendiri pada paket Pro."]],
  },
  {
    slug: "relawan",
    title: "Sertifikat Relawan & Kegiatan Sosial",
    keyword: "sertifikat relawan",
    intro: "Beri penghargaan kepada relawan dengan sertifikat yang rapi dan bisa diverifikasi, dibuat otomatis setelah relawan mengisi formulir kehadiran.",
    who: "Komunitas sosial, lembaga swadaya, dan penyelenggara kegiatan lingkungan.",
    contents: ["Nama relawan", "Nama kegiatan dan tanggal", "Lokasi kegiatan", "Nomor sertifikat", "Tanda tangan koordinator dan QR"],
    tips: ["Pilih template bertema lingkungan atau kemanusiaan untuk kesan yang sesuai.", "Bagikan link formulir lewat grup WhatsApp relawan.", "Gunakan persetujuan manual jika hanya relawan yang hadir penuh yang menerima sertifikat."],
    templates: ["eco-hijau", "medic-care"],
    sampleEvent: { name: "Aksi Bersih Pantai dan Penanaman Mangrove", certType: "Relawan" },
    faq: [["Apakah tersedia template bertema lingkungan?", "Ya. Template Lingkungan, bunga, dan kesehatan tersedia pada paket Pro."], ["Berapa lama membuat sertifikat untuk 100 relawan?", "Cukup bagikan satu link; relawan mengisi sendiri dan sertifikat langsung terbit."]],
  },
];

export const getSeoPage = (slug: string) => SEO_PAGES.find((p) => p.slug === slug);
