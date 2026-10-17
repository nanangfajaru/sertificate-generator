-- Periode masa berlaku Pro per pesanan (untuk invoice) + penanda invoice sudah dikirim via email.
alter table public.orders
  add column if not exists period_start timestamptz,
  add column if not exists period_end timestamptz,
  add column if not exists invoice_sent_at timestamptz;
