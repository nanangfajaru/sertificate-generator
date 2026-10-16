"use client";

import { FileArchive, Pencil } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import CopyButton from "@/components/CopyButton";
import { CERT_ZIP_BATCH, type Participant } from "@/lib/db";
import EditParticipantDialog, { type EditField } from "./EditParticipantDialog";
import { deleteParticipants, resendCertificateEmails, revokeParticipants, setParticipantStatus } from "../../../actions";

const STATUS = {
  pending: ["Menunggu", "badge-warn"],
  approved: ["Disetujui", "badge-ok"],
  rejected: ["Ditolak", "badge-bad"],
  revoked: ["Dicabut", "badge-revoked"],
} as const;

export default function ParticipantsTable({ programId, fields, rows, siteUrl, nameId, canEdit }: { programId: string; fields: EditField[]; rows: Participant[]; siteUrl: string; nameId: string | null; canEdit: boolean }) {
  const [editing, setEditing] = useState<Participant | null>(null);
  const zipForm = useRef<HTMLFormElement>(null);
  const zipIds = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<"all" | Participant["status"]>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!needle || Object.values(r.data).some((v) => String(v).toLowerCase().includes(needle)) || (r.cert_number ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, filter, q]);
  const PAGE = 50;
  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const cur = Math.min(page, pages);
  const visible = shown.slice((cur - 1) * PAGE, cur * PAGE);

  const allSelected = shown.length > 0 && shown.every((r) => sel.has(r.id));
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(shown.map((r) => r.id)));
  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const [okMsg, setOkMsg] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string; message?: string }>) {
    setMsg(null);
    setOkMsg(null);
    start(async () => {
      const res = await fn();
      if (res.error) setMsg(res.error);
      else {
        setSel(new Set());
        if (res.message) setOkMsg(res.message);
      }
    });
  }
  const ids = [...sel];
  const selRows = rows.filter((r) => sel.has(r.id));
  const hasApproved = selRows.some((r) => r.status === "approved");
  const hasRevoked = selRows.some((r) => r.status === "revoked");
  const hasIssued = selRows.some((r) => r.status === "approved" || r.status === "revoked");

  /** Unduh sertifikat peserta terpilih (hanya yang disetujui) sebagai ZIP lewat form POST. */
  function downloadZip() {
    const approvedIds = selRows.filter((r) => r.status === "approved").map((r) => r.id);
    setMsg(null);
    if (approvedIds.length > CERT_ZIP_BATCH) return setMsg(`Maksimal ${CERT_ZIP_BATCH} sertifikat sekali unduh. Kurangi pilihan atau gunakan "Unduh semua sertifikat (ZIP)".`);
    if (zipIds.current && zipForm.current) {
      zipIds.current.value = approvedIds.join(",");
      zipForm.current.submit();
    }
  }

  function revoke() {
    const n = selRows.filter((r) => r.status === "approved").length;
    const reason = window.prompt(`Cabut ${n} sertifikat?\n\nTautan dan QR-nya akan menampilkan "Sertifikat telah dicabut". Alasan (opsional, hanya terlihat oleh panitia):`, "");
    if (reason === null) return;
    run(() => revokeParticipants(programId, ids, reason));
  }

  function remove() {
    const base = `Hapus ${sel.size} peserta secara permanen?`;
    const warn = hasIssued
      ? `${base}\n\nSebagian sudah memiliki sertifikat. Jika dihapus, tautan dan QR sertifikatnya hanya akan menampilkan "tidak ditemukan", tanpa penjelasan bahwa sertifikat itu dicabut.\n\nUntuk sertifikat yang tidak valid, gunakan "Cabut sertifikat". Tetap hapus?`
      : base;
    if (confirm(warn)) run(() => deleteParticipants(programId, ids));
  }

  return (
    <div className="space-y-3">
      <form ref={zipForm} method="post" action={`/api/programs/${programId}/certificates`} className="hidden">
        <input ref={zipIds} type="hidden" name="ids" />
      </form>
      {editing && (
        <EditParticipantDialog
          programId={programId}
          participantId={editing.id}
          fields={fields}
          nameId={nameId}
          initial={editing.data as Record<string, string>}
          issued={editing.status === "approved" || editing.status === "revoked"}
          onClose={() => setEditing(null)}
        />
      )}
      <div className="card flex flex-wrap items-center gap-2 !p-3">
        <select className="input !w-auto" value={filter} onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(1); }}>
          <option value="all">Semua status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="revoked">Dicabut</option>
        </select>
        <input className="input !w-64" placeholder="Cari nama, email, atau nomor…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <span className="ml-auto text-sm text-slate-500">{shown.length} peserta</span>
      </div>

      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 p-2">
          <span className="px-2 text-sm font-medium">{sel.size} dipilih</span>
          <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => setParticipantStatus(programId, ids, "approved"))}>Setujui</button>
          <button className="btn btn-sm" disabled={pending} onClick={() => run(() => setParticipantStatus(programId, ids, "rejected"))}>Tolak</button>
          <button className="btn btn-sm" disabled={pending} onClick={() => run(() => setParticipantStatus(programId, ids, "pending"))}>Kembalikan ke menunggu</button>
          {hasApproved && <button className="btn btn-sm" disabled={pending} onClick={downloadZip} title="Hanya peserta yang disetujui"><FileArchive className="h-4 w-4" /> Unduh sertifikat ({selRows.filter((r) => r.status === "approved").length})</button>}
          <button className="btn btn-sm" disabled={pending} onClick={() => run(() => resendCertificateEmails(programId, ids))}>Kirim email sertifikat</button>
          {hasApproved && <button className="btn btn-danger btn-sm" disabled={pending} onClick={revoke}>Cabut sertifikat</button>}
          {hasRevoked && <button className="btn btn-sm" disabled={pending} onClick={() => run(() => setParticipantStatus(programId, ids, "approved"))}>Pulihkan</button>}
          <button className="btn btn-danger btn-sm" disabled={pending} onClick={remove}>Hapus</button>
        </div>
      )}
      {msg && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{msg}</p>}
      {okMsg && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{okMsg}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-3 py-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Pilih semua" /></th>
              <th className="px-3 py-2">Waktu</th>
              {fields.map((f) => <th key={f.id} className="px-3 py-2">{f.label}</th>)}
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">No. sertifikat</th>
              <th className="px-3 py-2">Link sertifikat</th>
              <th className="px-3 py-2">Email</th>
              {canEdit && <th className="w-12 px-3 py-2"><span className="sr-only">Edit</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shown.length === 0 && (
              <tr><td colSpan={fields.length + (canEdit ? 7 : 6)} className="px-3 py-14 text-center"><p className="font-medium text-slate-700">Belum ada peserta</p><p className="mt-1 text-sm text-slate-500">Bagikan link atau QR pendaftaran dari tab Ringkasan agar peserta mulai mengisi.</p></td></tr>
            )}
            {visible.map((r) => (
              <tr key={r.id} className={`transition hover:bg-slate-50/70 ${sel.has(r.id) ? "bg-brand-50/50" : ""}`}>
                <td className="px-3 py-2"><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-500">{new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                {fields.map((f) => <td key={f.id} className="max-w-56 truncate px-3 py-2">{r.data[f.id] ?? ""}</td>)}
                <td className="px-3 py-2"><span className={`badge ${STATUS[r.status][1]}`} title={r.status === "revoked" ? (r.revoked_reason ? `Alasan: ${r.revoked_reason}` : "Dicabut oleh panitia") : undefined}>{STATUS[r.status][0]}</span></td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.cert_number ?? "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {r.status === "approved" ? (
                    <div className="flex items-center gap-1.5">
                      <CopyButton text={`${siteUrl}/c/${r.code}`} label="Salin" />
                      <a href={`/c/${r.code}`} target="_blank" className="btn btn-sm">Buka</a>
                    </div>
                  ) : r.status === "revoked" ? (
                    <span className="text-xs text-slate-400">Tidak berlaku</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs">
                  {r.emailed_at ? <span className="badge badge-ok" title={new Date(r.emailed_at).toLocaleString("id-ID")}>Terkirim</span> : <span className="text-slate-400">—</span>}
                </td>
                {canEdit && (
                  <td className="px-3 py-2">
                    <button type="button" className="btn btn-sm !px-2" onClick={() => setEditing(r)} aria-label="Edit data peserta" title="Edit data peserta"><Pencil className="h-3.5 w-3.5" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-slate-500">{(cur - 1) * PAGE + 1}–{Math.min(cur * PAGE, shown.length)} dari {shown.length} peserta</p>
          <div className="flex items-center gap-1.5">
            <button className="btn btn-sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="Sebelumnya">‹</button>
            <span className="px-2 text-slate-600">{cur} / {pages}</span>
            <button className="btn btn-sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="Berikutnya">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
