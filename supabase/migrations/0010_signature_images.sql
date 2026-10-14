-- Gambar tanda tangan penandatangan (opsional).
alter table public.programs add column if not exists signer1_sig_path text, add column if not exists signer2_sig_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('signatures', 'signatures', false, 1048576, array['image/png', 'image/jpeg'])
on conflict (id) do nothing;
