# Backlog pemasaran SertifikatKu

## Email
- **noreply@sertifikatku.com**: email otomatis aplikasi (sertifikat, invoice, verifikasi akun) via Resend. Hanya kirim.
- **halo@sertifikatku.com**: email kontak yang bisa menerima & membalas, untuk outreach agen pencari pelanggan.

## Belum dikerjakan
- [ ] Penerusan email halo@ (pengingat terjadwal Senin 19 Okt 2026):
  1. ImprovMX: daftar, tambah domain sertifikatku.com, alias `halo` → nanangfajaru@gmail.com
  2. DNS Hostinger: hapus MX bawaan; MX `@` mx1.improvmx.com (10) & mx2.improvmx.com (20);
     SPF TXT `@` digabung: `include:spf.improvmx.com` (jangan ubah record send / resend._domainkey / _dmarc / Vercel)
  3. Gmail "Send mail as" halo@ via smtp.resend.com:465, user `resend`, password API key Resend (Sending access)
  4. Tes kirim & terima
- [ ] Google Search Console: verifikasi domain + kirim sitemap (https://sertifikatku.com/sitemap.xml)
- [ ] Metricool + akun sosmed + konektor Metricool di claude.ai
- [ ] Izin jaringan environment ke jvfzbthfemhviogfwzeu.supabase.co + secret SUPABASE_SERVICE_ROLE_KEY (upload video)
- [ ] Buku panduan 4 agen AI (Strategi & Analitik, Konten, SEO, Pencari Pelanggan) + tugas terjadwal
- [ ] Sesi "Markas Pemasaran" untuk persetujuan (bukan halaman web)
