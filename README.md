# Sertifikat Online

SaaS e-sertifikat: buat program → bagikan link pendaftaran → sertifikat PDF terbit otomatis (atau setelah approval).
Stack: Next.js 16 (App Router) · Supabase (Auth Google, Postgres, Storage) · Vercel.

## Paket

| | Free | Pro |
|---|---|---|
| Program | maks. 5 | tanpa batas |
| Template | 25 | semua (45, bisa ditambah) |
| Upload desain sendiri (PDF/PNG/JPG) + atur posisi teks | – | ✔ |

Batas diterapkan di database (trigger `enforce_program_rules`) dan storage policy, bukan hanya di UI.

## Setup

1. **Supabase**: buat project, lalu jalankan `supabase/migrations/0001_init.sql` di SQL Editor.
2. **Google login**: Google Cloud Console → OAuth Client (Web). Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
   Supabase → Authentication → Providers → Google → isi Client ID & Secret.
   Authentication → URL Configuration: Site URL = URL aplikasi, tambahkan `http://localhost:3000/**` dan URL Vercel ke Redirect URLs.
3. **Email sistem (SMTP sendiri)**: konfirmasi pendaftaran dan reset password dikirim langsung oleh aplikasi lewat SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`), bukan mailer bawaan Supabase. Tautan dibuat server (`auth.admin.generateLink`) dan diverifikasi di `/auth/confirm`. Bisa memakai penyedia SMTP apa pun (Resend, Brevo, Mailgun, Gmail App Password). Jalankan juga `supabase/migrations/0003_auth_email.sql`. Biarkan *Confirm email* di Supabase tetap aktif agar akun belum terkonfirmasi tidak bisa masuk.
4. **Env**: salin `.env.example` ke `.env.local` dan isi (di Vercel isi di Project Settings → Environment Variables).
5. `npm install && npm run dev`.

### Admin owner & seeder

Jalankan migration `0002_admin.sql` (sudah termasuk di folder `supabase/migrations`). Lalu buat admin owner + 20 contoh program:

```bash
# .env.local harus berisi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY
SEED_ADMIN_EMAIL=owner@domain.com SEED_ADMIN_PASSWORD='password-kuat' npm run seed
npm run seed -- --dry     # lihat rencana tanpa menyentuh database
npm run seed -- --reset   # hapus contoh program lama (slug contoh-*) lalu buat ulang
```

- Email belum terdaftar → akun dibuat (email terkonfirmasi). Sudah terdaftar (mis. lewat Google) → langsung dijadikan admin, password tidak diubah. Tanpa `SEED_ADMIN_PASSWORD`, password acak dicetak sekali di terminal.
- Admin otomatis Pro tanpa kedaluwarsa dan dapat membuka `/admin`: ringkasan, seluruh pengguna (ubah paket Free/Pro + masa berlaku), seluruh program, dan peserta tiap program.
- Alternatif tanpa terminal dan tanpa service role key: daftar dulu lewat `/login`, lalu jalankan `supabase/seed/examples.sql` di Supabase SQL Editor (ganti `owner@example.com` di baris terakhir). Hasilnya sama: admin + Pro dan 20 contoh program.
- Alternatif hanya menjadikan admin (akun sudah ada): `update public.profiles set is_admin = true, plan = 'pro', plan_expires_at = null where email = 'owner@domain.com';`
- Seeder aman dijalankan ulang (program yang sudah ada dilewati).

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

## Checklist setelah deploy

- [ ] `SUPABASE_SERVICE_ROLE_KEY` terisi di Vercel (Production + Preview), lalu redeploy
- [ ] Vercel Authentication nonaktif (Settings → Deployment Protection)
- [ ] Supabase → Authentication → URL Configuration: Site URL dan Redirect URLs berisi domain produksi
- [ ] (Opsional) Provider Google aktif di Supabase dengan OAuth Client dari Google Cloud Console
- [ ] `npm run seed` dijalankan sekali untuk membuat admin owner dan 20 contoh program
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM terisi di Vercel (email konfirmasi & reset password), lalu redeploy
