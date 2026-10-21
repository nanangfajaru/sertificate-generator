-- Kode bayar dari Midtrans untuk pesanan menunggu bayar (ditampilkan di halaman Berlangganan).
-- { "code": nomor VA / kode bayar, "biller": kode perusahaan (khusus Mandiri Bill), "expires_at": batas bayar }
alter table public.orders add column if not exists payment_info jsonb;
