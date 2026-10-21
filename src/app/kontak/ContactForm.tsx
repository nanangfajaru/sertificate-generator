"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { sendContact, type ContactState } from "./actions";

const REPORT = "Laporan penyalahgunaan / sertifikat palsu";
const TOPICS = ["Pertanyaan umum", "Bantuan akun & teknis", "Paket Pro & pembayaran", "Kerja sama / mitra", REPORT, "Lainnya"];

export default function ContactForm() {
  const [s, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  // Waktu form mulai tampil (diisi oleh JavaScript): bot yang mengirim langsung/instan tidak punya nilai wajar.
  const [shownAt, setShownAt] = useState("");
  // Dari tautan "Laporkan" di halaman sertifikat: /kontak?topik=laporan&kode=…
  const [prefill, setPrefill] = useState<{ topic: string; message: string } | null>(null);
  useEffect(() => {
    setShownAt(String(Date.now()));
    const q = new URLSearchParams(window.location.search);
    if (q.get("topik") === "laporan") {
      const kode = (q.get("kode") ?? "").replace(/[^\w-]/g, "").slice(0, 40);
      setPrefill({ topic: REPORT, message: kode ? `Kode sertifikat: ${kode}\n\nAlasan laporan: ` : "" });
    }
  }, []);
  if (s.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="mt-3 text-lg font-semibold text-slate-900">Pesan terkirim</h2>
        <p className="mt-1 text-sm text-slate-600">Terima kasih. Kami akan membalas ke email Anda, biasanya dalam 1 hari kerja.</p>
      </div>
    );
  }
  return (
    <form key={prefill ? "lapor" : "biasa"} action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-name">Nama</label><input id="c-name" name="name" className="input" required maxLength={80} autoComplete="name" /></div>
        <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" className="input" required maxLength={120} autoComplete="email" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="c-org">Instansi / penyelenggara <span className="font-normal text-slate-400">(opsional)</span></label><input id="c-org" name="org" className="input" maxLength={120} /></div>
        <div>
          <label className="label" htmlFor="c-topic">Topik</label>
          <select id="c-topic" name="topic" className="input" defaultValue={prefill?.topic ?? TOPICS[0]}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
      </div>
      <div><label className="label" htmlFor="c-msg">Pesan</label><textarea id="c-msg" name="message" className="input" rows={6} required minLength={10} maxLength={3000} defaultValue={prefill?.message} placeholder="Ceritakan kebutuhan atau kendala Anda…" /></div>
      {/* Jebakan bot: tidak terlihat pengunjung (di luar layar, bukan display:none yang mudah dikenali bot). */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="t" value={shownAt} />
      {s.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{s.error}</p>}
      <button className="btn btn-primary w-full py-2.5" disabled={pending}><Send className="h-4 w-4" /> {pending ? "Mengirim…" : "Kirim pesan"}</button>
    </form>
  );
}
