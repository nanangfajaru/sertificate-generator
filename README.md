# Sertifikat Online

SaaS e-sertifikat: buat program → bagikan link pendaftaran → sertifikat PDF terbit otomatis (atau setelah approval).
Stack: Next.js 16 (App Router) · Supabase (Auth Google, Postgres, Storage) · Vercel.

## Paket

| | Free | Pro |
|---|---|---|
| Program | maks. 5 | tanpa batas |
| Template | 5 | semua (25, bisa ditambah) |
| Upload desain sendiri (PDF/PNG/JPG) + atur posisi teks | – | ✔ |

Batas diterapkan di database (trigger `enforce_program_rules`) dan storage policy, bukan hanya di UI.

## Setup

1. **Supabase**: buat project, lalu jalankan `supabase/migrations/0001_init.sql` di SQL Editor.
2. **Google login**: Google Cloud Console → OAuth Client (Web). Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
   Supabase → Authentication → Providers → Google → isi Client ID & Secret.
   Authentication → URL Configuration: Site URL = URL aplikasi, tambahkan `http://localhost:3000/**` dan URL Vercel ke Redirect URLs.
3. **Env**: salin `.env.example` ke `.env.local` dan isi (di Vercel isi di Project Settings → Environment Variables).
4. `npm install && npm run dev`.

### Menjadikan user Pro (sementara, sebelum payment gateway)

```sql
update public.profiles set plan = 'pro' where email = 'user@example.com';
-- opsional masa aktif: plan_expires_at = now() + interval '1 year'
```

## Struktur singkat

- `src/lib/certificate/` – mesin sertifikat: `templates/` (25 template berbasis kode), `sources.ts` (sumber data & resolver), `pdf.ts` (PDF server-side dengan pdf-lib), `CertificateSvg` (pratinjau/editor).
- `src/app/dashboard/` – admin: program, form builder, template & editor desain, peserta (approval massal), ekspor CSV.
- `src/app/p/[slug]` – form pendaftaran publik · `src/app/c/[code]` – halaman sertifikat/verifikasi · `src/app/api/cert/[code]` – unduh PDF.
- Halaman publik membaca data lewat service role di server; anon tidak punya akses tabel (RLS).

## Menambah template

Tambahkan baris di `PRO` pada `src/lib/certificate/templates/index.ts` (kombinasi family + palette), atau buat family baru di `families.ts`.

## Catatan

- Font PDF tertanam (Inter, Playfair Display, Great Vibes) hanya mencakup aksara Latin.
- Pembayaran (payment gateway) belum diimplementasikan; kolom `profiles.plan` / `plan_expires_at` sudah disiapkan.

## Deploy (Vercel)

1. Import repo ini di Vercel (framework Next.js terdeteksi otomatis).
2. Isi Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API Keys → service_role / secret), `NEXT_PUBLIC_SITE_URL` (URL produksi, tanpa slash di akhir).
3. Tambahkan URL produksi ke Supabase → Authentication → URL Configuration → Redirect URLs (`https://<domain>/**`).
4. Matikan Vercel Authentication (Settings → Deployment Protection) agar halaman publik peserta bisa dibuka tanpa login Vercel.
