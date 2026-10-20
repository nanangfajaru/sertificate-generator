-- Metode pembayaran dari Midtrans (mis. "Virtual Account BCA", "QRIS") untuk invoice & riwayat,
-- dan status "cancelled" untuk pesanan yang dibatalkan pembeli (atau diganti metode bayarnya).
alter table public.orders add column if not exists payment_method text;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled'));
