import "server-only";
import { after } from "next/server";
import { createAdminClient } from "./supabase/admin";
import type { Program } from "./db";
import { mailConfigured } from "./mailer";
import { notifyApproved } from "./notify";
import { formatCertNumber } from "./util";
import { allowedByGate, getProGate, type ProgramForGate } from "./pro-gate";

/**
 * Menyetujui peserta dan memberi nomor sertifikat berurutan. Dipakai juga oleh form publik (mode auto).
 * Bila Pro pemilik sudah berakhir dan program memakai fitur Pro, peserta yang mendaftar setelah
 * tanggal berakhir dilewati (tetap menunggu) dan dihitung di `blocked`.
 */
export async function approveParticipants(program: Pick<Program, "id" | "number_format" | "notify_email"> & ProgramForGate, ids: string[]): Promise<{ approved: number; blocked: number }> {
  const admin = createAdminClient();
  const [{ data: rows }, gate] = await Promise.all([
    admin.from("participants").select("id, cert_number, approved_at, created_at").eq("program_id", program.id).in("id", ids).order("created_at"),
    getProGate(admin, program),
  ]);
  const all = rows ?? [];
  const list = all.filter((r) => allowedByGate(gate, r.created_at as string));
  const blocked = all.length - list.length;
  if (!list.length) return { approved: 0, blocked };
  // Satu kali ambil blok nomor urut untuk semua peserta yang belum bernomor (bukan satu RPC per peserta).
  const need = list.filter((r) => !r.cert_number).length;
  let next = 0;
  if (need) {
    const { data: last, error } = await admin.rpc("next_cert_seq_n", { p_program: program.id, p_n: need });
    if (error) throw new Error(`Gagal mengambil nomor sertifikat: ${error.message}`);
    next = Number(last) - need + 1;
  }
  const now = new Date().toISOString();
  const updates = list.map((r) => ({
    id: r.id as string,
    cert_number: (r.cert_number as string | null) ?? formatCertNumber(program.number_format, next++),
    approved_at: (r.approved_at as string | null) ?? now,
  }));
  // Update paralel per kelompok kecil agar persetujuan massal cepat tanpa membanjiri koneksi.
  for (let i = 0; i < updates.length; i += 25) {
    await Promise.all(
      updates.slice(i, i + 25).map((u) =>
        admin.from("participants").update({ status: "approved", cert_number: u.cert_number, approved_at: u.approved_at, revoked_at: null, revoked_reason: null }).eq("id", u.id),
      ),
    );
  }
  const approvedIds = updates.map((u) => u.id);

  // Kirim email "sertifikat terbit" setelah respons selesai, agar persetujuan massal tetap cepat.
  if (program.notify_email && mailConfigured() && approvedIds.length) {
    after(() => notifyApproved(program.id, approvedIds).then(() => undefined, (e) => console.error("notify gagal:", e)));
  }
  return { approved: approvedIds.length, blocked };
}
