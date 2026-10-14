-- Pembayaran (Midtrans), voucher diskon, dan referral.

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  label text,                                   -- nama pemilik / referrer
  discount_percent int not null default 0 check (discount_percent between 0 and 100),
  commission_percent int not null default 0 check (commission_percent between 0 and 100),
  max_uses int check (max_uses is null or max_uses > 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,                -- id untuk Midtrans
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  base_amount int not null,
  discount_amount int not null default 0,
  amount int not null,                          -- yang dibayar
  voucher_id uuid references public.vouchers (id) on delete set null,
  voucher_code text,
  commission_amount int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  payment_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_voucher_idx on public.orders (voucher_id);

alter table public.vouchers enable row level security;
alter table public.orders enable row level security;

-- vouchers: tanpa policy (hanya service role). orders: pemilik boleh membaca miliknya.
create policy "orders_select_own" on public.orders for select to authenticated using (user_id = auth.uid());
