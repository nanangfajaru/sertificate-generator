# Kepatuhan regulasi SertifikatKu

Catatan internal pemilik. Bukan nasihat hukum; cek ulang ke sumber resmi (OSS, Komdigi, DJP, DJKI) atau konsultan sebelum mengurus.

## Status

| Hal | Dasar | Status |
|---|---|---|
| NIB (OSS), KBLI 62019 / 63122 | PP 5/2021 | ☐ Pemilik |
| Pendaftaran PSE Lingkup Privat | Permenkominfo 5/2020 jo. 10/2021 | ☐ Pemilik (setelah NIB) |
| Merek "SertifikatKu" di DJKI | UU 20/2016 | ☐ Pemilik |
| Rekening usaha terpisah + pembukuan omzet | PP 55/2022 (PPh Final 0,5%) | ☐ Pemilik |
| Kebijakan Privasi sesuai UU PDP (peran pengendali/prosesor, transfer luar negeri, hak, insiden 3×24 jam) | UU 27/2022 | ✅ 21 Okt 2026 |
| Syarat & Ketentuan: keabsahan dokumen elektronik, bukan TTE tersertifikasi, konten terlarang, refund, referral, hukum Indonesia | UU ITE, PP 71/2019, UU 8/1999 | ✅ 21 Okt 2026 |
| Saluran pelaporan konten/sertifikat palsu (tautan "Laporkan" di halaman sertifikat → Kontak) | PP 71/2019, Permenkominfo 5/2020 | ✅ 21 Okt 2026 |
| Analytics anonim tanpa data pribadi di URL | UU 27/2022 | ✅ |

## Hal yang tidak boleh diklaim

- "Tanda tangan elektronik resmi/tersertifikasi" — kita bukan PSrE.
- "Sertifikat diakui instansi X / bernilai SKP" — tergantung penyelenggara.
- "Data disimpan di Indonesia" — data ada di Singapura (Supabase) dan jaringan Vercel.

## Menangani laporan penyalahgunaan

1. Laporan masuk di Admin → Pesan masuk (topik "Laporan penyalahgunaan / sertifikat palsu").
2. Buka kode sertifikat yang dilaporkan, cek program & penyelenggaranya.
3. Bila jelas melanggar (kegiatan fiktif, memalsukan lembaga): hapus/nonaktifkan program dari Admin → Program, catat alasannya, balas pelapor.
4. Bila meragukan: hubungi penyelenggara lewat email akunnya, minta klarifikasi 2×24 jam.
5. Permintaan dari instansi berwenang (Komdigi, kepolisian): tindak lanjuti sesuai batas waktu di surat, simpan salinan surat.

## Bila terjadi kebocoran data (UU PDP: pemberitahuan maks. 3×24 jam)

1. **Hentikan**: ganti kunci yang bocor (Supabase service role, Midtrans server key, SMTP) di Vercel, cabut sesi bila perlu.
2. **Catat**: kapan diketahui, data apa yang terdampak, berapa akun/peserta, penyebab.
3. **Beri tahu dalam 3×24 jam** sejak diketahui:
   - pemilik data terdampak (email penyelenggara; penyelenggara memberi tahu pesertanya),
   - lembaga pelindungan data / Komdigi sesuai ketentuan yang berlaku saat itu.
   Isi: data yang terungkap, kapan & bagaimana, upaya penanganan dan pemulihan.
4. **Perbaiki** penyebabnya dan simpan catatan insiden.
