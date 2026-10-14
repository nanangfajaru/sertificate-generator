-- Link pendek (alias) program, token halaman mitra referral, dan sumber pendaftar.
alter table public.programs add column if not exists alias text unique;
alter table public.programs add constraint programs_alias_format check (alias is null or (alias ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(alias) between 3 and 40));

alter table public.vouchers add column if not exists partner_token text unique default encode(gen_random_bytes(12), 'hex');
update public.vouchers set partner_token = encode(gen_random_bytes(12), 'hex') where partner_token is null;

alter table public.profiles add column if not exists signup_source text;
