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
