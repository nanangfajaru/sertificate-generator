-- Catat hasil pengiriman email sistem supaya kegagalan SMTP mudah didiagnosis.
alter table public.auth_email_log add column if not exists ok boolean;
alter table public.auth_email_log add column if not exists error text;
