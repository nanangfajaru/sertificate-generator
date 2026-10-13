-- Seeder contoh data (tanpa service role key, tanpa terminal).
-- Cara pakai: ganti 'owner@example.com' di baris paling bawah dengan email akun yang SUDAH terdaftar
-- (lewat halaman /login), lalu jalankan seluruh isi file ini di Supabase SQL Editor.
--
-- Efek: akun itu dijadikan admin + Pro permanen, lalu dibuat 20 contoh program beserta peserta.
-- Aman dijalankan ulang: program dengan slug "contoh-*" yang sudah ada dilewati.

create or replace function pg_temp.seed_examples(p_email text)
returns text
language plpgsql
as $fn$
declare
  v_owner uuid;
  v_programs jsonb := '[{"key":"seminar-nasional-teknologi","name":"Seminar Nasional Teknologi Pendidikan 2026","org":"Universitas Nusantara Digital","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-03-14","end":null,"loc":"Jakarta","approval":"auto","tpl":"classic-navy","s1":["Dr. Budi Santoso, M.Kom","Ketua Panitia"],"s2":["Prof. Siti Aminah, Ph.D","Dekan Fakultas Teknik"],"n":24},{"key":"workshop-ui-ux","name":"Workshop UI/UX Design untuk Pemula","org":"Komunitas Kreator Muda","cert":"Peserta","desc":"telah menyelesaikan seluruh sesi dalam kegiatan","start":"2026-02-21","end":"2026-02-22","loc":"Bandung","approval":"auto","tpl":"modern-teal","s1":["Rina Kusuma","Koordinator Komunitas"],"s2":null,"n":18},{"key":"webinar-literasi-digital","name":"Webinar Literasi Digital Nasional","org":"Dinas Komunikasi dan Informatika Kota Contoh","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-05-09","end":null,"loc":"Daring","approval":"auto","tpl":"ribbon-slate","s1":["Ir. Hendra Wijaya, M.M.","Kepala Dinas"],"s2":null,"n":25},{"key":"pelatihan-kepemimpinan","name":"Pelatihan Kepemimpinan Organisasi","org":"Himpunan Mahasiswa Informatika","cert":"Peserta","desc":"telah mengikuti seluruh rangkaian kegiatan","start":"2026-04-04","end":"2026-04-06","loc":"Bogor","approval":"manual","tpl":"corner-navy","s1":["Fajar Nugroho","Ketua Umum"],"s2":["Dewi Lestari, M.Pd.","Pembina"],"n":20},{"key":"lomba-karya-tulis","name":"Lomba Karya Tulis Ilmiah Tingkat Nasional","org":"Politeknik Cendekia","cert":"Juara 1","desc":"atas prestasinya dalam kegiatan","start":"2026-06-18","end":null,"loc":"Surabaya","approval":"manual","tpl":"seal-navy","s1":["Dr. Agus Prasetyo, M.T.","Direktur"],"s2":["Maya Anggraini, M.Si.","Ketua Panitia"],"n":8},{"key":"magang-industri","name":"Program Magang Industri Batch 3","org":"PT Maju Bersama Teknologi","cert":"Magang","desc":"telah menyelesaikan program magang pada","start":"2026-01-05","end":"2026-04-03","loc":"Jakarta","approval":"manual","tpl":"split-indigo","s1":["Andika Putra","Head of Human Capital"],"s2":null,"n":12},{"key":"bimtek-guru","name":"Bimbingan Teknis Kurikulum bagi Guru","org":"Dinas Pendidikan Kota Contoh","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-07-11","end":"2026-07-12","loc":"Yogyakarta","approval":"auto","tpl":"stripe-forest","s1":["Drs. Slamet Riyadi, M.Pd.","Kepala Dinas Pendidikan"],"s2":null,"n":25},{"key":"kuliah-umum","name":"Kuliah Umum Kecerdasan Buatan","org":"Universitas Nusantara Digital","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-08-20","end":null,"loc":"Semarang","approval":"auto","tpl":"frame-navy","s1":["Prof. Siti Aminah, Ph.D","Dekan Fakultas Teknik"],"s2":null,"n":22},{"key":"pelatihan-umkm","name":"Pelatihan Pemasaran Digital untuk UMKM","org":"Yayasan Bina Karya","cert":"Peserta","desc":"telah mengikuti pelatihan","start":"2026-03-28","end":null,"loc":"Bekasi","approval":"auto","tpl":"minimal-forest","s1":["Hj. Nurhayati","Ketua Yayasan"],"s2":null,"n":19},{"key":"bakti-sosial","name":"Bakti Sosial Ramadan Berbagi","org":"Karang Taruna Harapan Jaya","cert":"Panitia","desc":"atas kontribusinya sebagai panitia dalam kegiatan","start":"2026-03-08","end":null,"loc":"Depok","approval":"manual","tpl":"geometric-crimson","s1":["Yusuf Maulana","Ketua Karang Taruna"],"s2":null,"n":15},{"key":"pelatihan-first-aid","name":"Pelatihan Pertolongan Pertama (First Aid)","org":"Palang Merah Remaja Kota Contoh","cert":"Peserta","desc":"telah lulus pelatihan","start":"2026-09-05","end":null,"loc":"Malang","approval":"manual","tpl":"corner-crimson","s1":["dr. Ratna Sari","Instruktur Utama"],"s2":null,"n":16},{"key":"konferensi-riset","name":"Konferensi Riset dan Inovasi 2026","org":"Institut Sains dan Teknologi Nusantara","cert":"Pemakalah","desc":"atas partisipasinya sebagai pemakalah dalam kegiatan","start":"2026-09-24","end":"2026-09-25","loc":"Bali","approval":"manual","tpl":"classic-teal","s1":["Prof. Dr. Bambang Hartono","Ketua Konferensi"],"s2":["Dr. Laksmi Dewi","Ketua Panitia"],"n":14},{"key":"bootcamp-data","name":"Bootcamp Analisis Data","org":"Akademi Data Nusantara","cert":"Lulus","desc":"telah dinyatakan lulus dari program","start":"2026-02-02","end":"2026-03-27","loc":"Daring","approval":"manual","tpl":"split-teal","s1":["Reza Pratama","Direktur Akademik"],"s2":null,"n":17},{"key":"pelatihan-k3","name":"Pelatihan Keselamatan dan Kesehatan Kerja","org":"PT Karya Mandiri Sejahtera","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-05-22","end":null,"loc":"Cikarang","approval":"auto","tpl":"stripe-navy","s1":["Ir. Wahyu Hidayat","Manajer HSE"],"s2":null,"n":21},{"key":"festival-literasi","name":"Festival Literasi dan Budaya","org":"Perpustakaan Daerah Kota Contoh","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-10-03","end":"2026-10-04","loc":"Solo","approval":"auto","tpl":"frame-forest","s1":["Sri Wahyuni, S.S.","Kepala Perpustakaan"],"s2":null,"n":23},{"key":"olimpiade-sains","name":"Olimpiade Sains Siswa Tingkat Provinsi","org":"SMA Negeri 1 Harapan","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-04-25","end":null,"loc":"Palembang","approval":"auto","tpl":"ribbon-crimson","s1":["Drs. Mulyadi, M.Pd.","Kepala Sekolah"],"s2":["Anita Rahma, S.Pd.","Ketua Panitia"],"n":25},{"key":"pelatihan-bahasa","name":"Pelatihan Bahasa Inggris Profesional","org":"Lembaga Kursus Cakrawala","cert":"Peserta","desc":"telah menyelesaikan pelatihan","start":"2026-06-01","end":"2026-06-30","loc":"Medan","approval":"auto","tpl":"modern-forest","s1":["Michael Tanuwijaya, M.A.","Direktur Lembaga"],"s2":null,"n":18},{"key":"talkshow-karier","name":"Talkshow Persiapan Karier Generasi Muda","org":"Pusat Karier Politeknik Cendekia","cert":"Peserta","desc":"atas partisipasinya dalam kegiatan","start":"2026-08-08","end":null,"loc":"Makassar","approval":"auto","tpl":"minimal-violet","s1":["Ayu Kartika, M.M.","Kepala Pusat Karier"],"s2":null,"n":20},{"key":"donor-darah","name":"Donor Darah Massal Peduli Sesama","org":"Palang Merah Remaja Kota Contoh","cert":"Relawan","desc":"atas partisipasinya sebagai relawan dalam kegiatan","start":"2026-09-13","end":null,"loc":"Tangerang","approval":"manual","tpl":"stripe-slate","s1":["dr. Ratna Sari","Ketua Pelaksana"],"s2":null,"n":13},{"key":"workshop-fotografi","name":"Workshop Fotografi Dasar","org":"Komunitas Foto Nusantara","cert":"Peserta","desc":"telah mengikuti workshop","start":"2026-07-26","end":null,"loc":"Denpasar","approval":"auto","tpl":"corner-forest","s1":["Bagus Setiawan","Ketua Komunitas"],"s2":null,"n":15}]'::jsonb;
  p jsonb;
  v_first text[] := array['Aisyah','Budi','Citra','Dimas','Eka','Fajar','Gita','Hendra','Indah','Joko','Kartika','Lukman','Maya','Nadia','Omar','Putri','Rizky','Sinta','Tegar','Umar','Vina','Wahyu','Yoga','Zahra','Anisa','Bayu','Dewi','Farhan','Intan','Reza'];
  v_last text[] := array['Pratama','Santoso','Lestari','Wijaya','Hidayat','Kusuma','Nugroho','Rahma','Saputra','Anggraini','Permana','Maulana','Setiawan','Handayani','Firmansyah','Ramadhan','Purnama','Wulandari','Susanto','Utami'];
  v_orgs text[] := array['Universitas Nusantara Digital','Politeknik Cendekia','PT Maju Bersama Teknologi','SMA Negeri 1 Harapan','Komunitas Kreator Muda','Yayasan Bina Karya','Institut Sains dan Teknologi Nusantara','Akademi Data Nusantara'];
  v_roman text[] := array['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  v_prog uuid; f_name uuid; f_email uuid; f_org uuid;
  v_slug text; v_i int; v_h bigint; v_name text; v_status text; v_seq int; v_created timestamptz; v_start date;
  v_cert text; v_made int := 0; v_skipped int := 0; v_people int := 0;
begin
  select id into v_owner from public.profiles where lower(email) = lower(p_email);
  if v_owner is null then
    raise exception 'Akun % belum terdaftar. Daftar dulu lewat halaman /login.', p_email;
  end if;

  update public.profiles set is_admin = true, plan = 'pro', plan_expires_at = null where id = v_owner;

  for p in select * from jsonb_array_elements(v_programs) loop
    v_slug := 'contoh-' || (p->>'key');
    if exists (select 1 from public.programs where slug = v_slug) then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    v_prog := gen_random_uuid(); f_name := gen_random_uuid(); f_email := gen_random_uuid(); f_org := gen_random_uuid();
    v_start := (p->>'start')::date;
    v_seq := 0;

    insert into public.programs (id, owner_id, slug, name, org_name, cert_type, description, start_date, end_date, location,
                                 signer1_name, signer1_title, signer2_name, signer2_title, approval_mode, template_id, mapping)
    values (v_prog, v_owner, v_slug, p->>'name', p->>'org', p->>'cert', p->>'desc', v_start, nullif(p->>'end','')::date, p->>'loc',
            p->'s1'->>0, p->'s1'->>1, p->'s2'->>0, p->'s2'->>1, p->>'approval', p->>'tpl',
            jsonb_build_object('name', f_name, 'extra', f_org));

    insert into public.program_fields (id, program_id, label, type, required, sort) values
      (f_name,  v_prog, 'Nama lengkap',     'text',  true,  0),
      (f_email, v_prog, 'Email',            'email', true,  1),
      (f_org,   v_prog, 'Instansi / asal',  'text',  false, 2);

    for v_i in 1..(p->>'n')::int loop
      v_h := abs(hashtext((p->>'key') || ':' || v_i))::bigint;
      v_name := v_first[1 + ((v_i * 7 + (v_h % 30)::int) % 30)] || ' ' || v_last[1 + ((v_i * 11 + (v_h % 20)::int) % 20)];
      v_status := 'approved';
      if p->>'approval' = 'manual' then
        v_status := case when (v_h % 100) < 70 then 'approved' when (v_h % 100) < 90 then 'pending' else 'rejected' end;
      end if;
      v_cert := null;
      if v_status = 'approved' then
        v_seq := v_seq + 1;
        v_cert := lpad(v_seq::text, 3, '0') || '/SERT/' || v_roman[extract(month from v_start)::int] || '/' || extract(year from v_start)::int;
      end if;
      v_created := v_start::timestamptz - make_interval(days => 1 + (v_h % 10)::int, hours => (v_h % 9)::int);

      insert into public.participants (program_id, code, data, status, cert_number, created_at, approved_at)
      values (v_prog,
              substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
              jsonb_build_object(f_name::text, v_name,
                                 f_email::text, lower(replace(v_name, ' ', '.')) || '@example.com',
                                 f_org::text, v_orgs[1 + ((v_i * 3 + (v_h % 8)::int) % 8)]),
              v_status, v_cert, v_created,
              case when v_status = 'approved' then v_created + interval '1 day' end);
      v_people := v_people + 1;
    end loop;

    update public.programs set cert_seq = v_seq where id = v_prog;
    v_made := v_made + 1;
  end loop;

  return format('Selesai: %s program dibuat, %s dilewati, %s peserta. %s sekarang admin + Pro.', v_made, v_skipped, v_people, p_email);
end
$fn$;

select pg_temp.seed_examples('owner@example.com');
