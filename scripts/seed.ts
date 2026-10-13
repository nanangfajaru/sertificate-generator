/**
 * Seeder: membuat/menaikkan akun admin owner (paket Pro permanen, dapat melihat semua data)
 * dan mengisi 20 contoh program beserta peserta.
 *
 *   SEED_ADMIN_EMAIL=owner@domain.com SEED_ADMIN_PASSWORD='...' npm run seed
 *   npm run seed -- --dry      # hanya menampilkan rencana, tanpa koneksi
 *   npm run seed -- --reset    # hapus contoh program lama (slug "contoh-*") lalu buat ulang
 *
 * Variabel (dibaca dari .env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_ADMIN_EMAIL (wajib), SEED_ADMIN_PASSWORD (opsional, hanya dipakai bila akun baru dibuat),
 * SEED_ADMIN_NAME (opsional).
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SHOWCASE } from "../src/lib/showcase";
import { formatCertNumber, randomCode } from "../src/lib/util";

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry");
const RESET = args.has("--reset");

const FIRST = ["Aisyah", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko", "Kartika", "Lukman", "Maya", "Nadia", "Omar", "Putri", "Rizky", "Sinta", "Tegar", "Umar", "Vina", "Wahyu", "Yoga", "Zahra", "Anisa", "Bayu", "Dewi", "Farhan", "Intan", "Reza"];
const LAST = ["Pratama", "Santoso", "Lestari", "Wijaya", "Hidayat", "Kusuma", "Nugroho", "Rahma", "Saputra", "Anggraini", "Permana", "Maulana", "Setiawan", "Handayani", "Firmansyah", "Ramadhan", "Purnama", "Wulandari", "Susanto", "Utami"];
const ORGS = ["Universitas Nusantara Digital", "Politeknik Cendekia", "PT Maju Bersama Teknologi", "SMA Negeri 1 Harapan", "Komunitas Kreator Muda", "Yayasan Bina Karya", "Institut Sains dan Teknologi Nusantara", "Akademi Data Nusantara"];

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const uuid = () => crypto.randomUUID();

function buildParticipants(s: (typeof SHOWCASE)[number], ids: { name: string; email: string; org: string }) {
  const r = rng(s.key);
  const used = new Set<string>();
  const start = new Date(`${s.start}T08:00:00Z`).getTime();
  const rows: { code: string; data: Record<string, string>; status: string; cert_number: string | null; created_at: string; approved_at: string | null }[] = [];
  let seq = 0;
  for (let i = 0; i < s.participants; i++) {
    let name = "";
    do name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    while (used.has(name));
    used.add(name);
    const created = new Date(start - Math.floor(r() * 10 + 1) * 86400000 + Math.floor(r() * 36000000));
    let status = "approved";
    if (s.approval === "manual") {
      const x = r();
      status = x < 0.7 ? "approved" : x < 0.9 ? "pending" : "rejected";
    }
    let cert_number: string | null = null;
    let approved_at: string | null = null;
    if (status === "approved") {
      seq++;
      cert_number = formatCertNumber("{no}/SERT/{bulan}/{tahun}", seq, new Date(`${s.start}T08:00:00Z`));
      approved_at = new Date(created.getTime() + 86400000).toISOString();
    }
    rows.push({
      code: randomCode(6),
      data: {
        [ids.name]: name,
        [ids.email]: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
        [ids.org]: pick(r, ORGS),
      },
      status,
      cert_number,
      created_at: created.toISOString(),
      approved_at,
    });
  }
  return { rows, seq };
}

async function main() {
  console.log(`Seeder ${DRY ? "(dry-run) " : ""}— ${SHOWCASE.length} contoh program`);
  if (DRY) {
    for (const s of SHOWCASE) {
      const { rows, seq } = buildParticipants(s, { name: "n", email: "e", org: "o" });
      const st = (k: string) => rows.filter((r) => r.status === k).length;
      console.log(`  contoh-${s.key.padEnd(30)} ${s.template.padEnd(18)} ${s.approval.padEnd(6)} peserta=${rows.length} disetujui=${st("approved")} menunggu=${st("pending")} ditolak=${st("rejected")} seq=${seq}`);
    }
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi (.env.local)");
  if (!email) throw new Error("SEED_ADMIN_EMAIL wajib diisi");

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1) Akun admin: pakai yang sudah ada, atau buat baru.
  let userId: string | null = null;
  for (let page = 1; !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (userId) {
    console.log(`Akun ${email} sudah ada — dijadikan admin (password tidak diubah).`);
  } else {
    const generated = !process.env.SEED_ADMIN_PASSWORD;
    const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
    if (password.length < 8) throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter");
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: process.env.SEED_ADMIN_NAME ?? "Owner" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Akun ${email} dibuat.${generated ? ` Password sementara: ${password}  (segera ganti)` : ""}`);
  }

  // 2) Profil: admin + Pro tanpa kedaluwarsa.
  const { error: pErr } = await db
    .from("profiles")
    .upsert({ id: userId, email, full_name: process.env.SEED_ADMIN_NAME ?? undefined, is_admin: true, plan: "pro", plan_expires_at: null }, { onConflict: "id" });
  if (pErr) throw pErr;

  // 3) Contoh program.
  if (RESET) {
    const { error } = await db.from("programs").delete().eq("owner_id", userId).like("slug", "contoh-%");
    if (error) throw error;
    console.log("Contoh program lama dihapus.");
  }

  let created = 0;
  let skipped = 0;
  for (const s of SHOWCASE) {
    const slug = `contoh-${s.key}`;
    const { data: exists } = await db.from("programs").select("id").eq("slug", slug).maybeSingle();
    if (exists) { skipped++; continue; }

    const ids = { name: uuid(), email: uuid(), org: uuid() };
    const { rows, seq } = buildParticipants(s, ids);
    const programId = uuid();

    const { error: e1 } = await db.from("programs").insert({
      id: programId,
      owner_id: userId,
      slug,
      name: s.name,
      org_name: s.org,
      cert_type: s.certType,
      description: s.description,
      start_date: s.start,
      end_date: s.end ?? null,
      location: s.location,
      cert_seq: seq,
      signer1_name: s.signer1[0],
      signer1_title: s.signer1[1],
      signer2_name: s.signer2?.[0] ?? null,
      signer2_title: s.signer2?.[1] ?? null,
      approval_mode: s.approval,
      template_id: s.template,
      mapping: { name: ids.name, extra: ids.org },
    });
    if (e1) throw new Error(`${slug}: ${e1.message}`);

    const { error: e2 } = await db.from("program_fields").insert([
      { id: ids.name, program_id: programId, label: "Nama lengkap", type: "text", required: true, sort: 0 },
      { id: ids.email, program_id: programId, label: "Email", type: "email", required: true, sort: 1 },
      { id: ids.org, program_id: programId, label: "Instansi / asal", type: "text", required: false, sort: 2 },
    ]);
    if (e2) throw new Error(`${slug} (field): ${e2.message}`);

    const { error: e3 } = await db.from("participants").insert(rows.map((r) => ({ ...r, program_id: programId })));
    if (e3) throw new Error(`${slug} (peserta): ${e3.message}`);
    created++;
    console.log(`  + ${s.name} (${rows.length} peserta)`);
  }
  console.log(`Selesai. Program dibuat: ${created}, dilewati (sudah ada): ${skipped}.`);
}

main().catch((e) => {
  console.error("Seeder gagal:", e instanceof Error ? e.message : e);
  process.exit(1);
});
