# Migrasi database

Jalankan berurutan (`0001_…`, `0002_…`, …). Setelah menerapkan DDL lewat MCP/SQL editor, catat juga di `supabase_migrations.schema_migrations`.

## Wajib untuk tabel BARU (sejak 30 Okt 2026)

Supabase tidak lagi otomatis memberi akses Data API ke tabel baru di schema `public`. Tanpa GRANT, kueri dari aplikasi (supabase-js, termasuk service role) gagal dengan *permission denied*. Tabel lama tidak terpengaruh.

Setiap migrasi yang membuat tabel baru harus menyertakan, di file yang sama:

```sql
create table public.nama_tabel ( ... );
alter table public.nama_tabel enable row level security;

-- Akses Data API (wajib sejak 30 Okt 2026). RLS tetap yang membatasi baris.
grant all on table public.nama_tabel to service_role;
grant select, insert, update, delete on table public.nama_tabel to authenticated;  -- hanya bila dibaca/ditulis pengguna login
-- grant select on table public.nama_tabel to anon;                               -- hanya bila perlu dibaca tanpa login
```

Tabel yang hanya dipakai server (service role), cukup `grant all ... to service_role` dan jangan beri akses ke `anon`/`authenticated`. Bila tabel memakai `serial`/`identity`, beri juga `grant usage, select on sequence ... to service_role`.
