import { BadgeCheck, CheckCircle2, Circle, Clock, Mail, ShieldAlert, XCircle } from "lucide-react";

/** n***@gmail.com — cukup untuk dikenali pemiliknya tanpa membuka alamat lengkap. */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 1)}***@${domain}`;
}

type Step = { label: string; state: "done" | "current" | "todo" };

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-5 space-y-3 text-left">
      {steps.map((s) => (
        <li key={s.label} className="flex items-center gap-3 text-sm">
          {s.state === "done" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : s.state === "current" ? <Clock className="h-5 w-5 shrink-0 text-amber-500" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
          <span className={s.state === "todo" ? "text-slate-400" : s.state === "current" ? "font-medium text-slate-900" : "text-slate-700"}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function PendingCard({ who, event, maskedEmail }: { who: string; event: string; maskedEmail: string | null }) {
  return (
    <div className="card text-center">
      <BadgeCheck className="mx-auto h-11 w-11 text-emerald-600" />
      <h1 className="mt-3 text-xl font-semibold">Kehadiran Anda berhasil dicatat</h1>
      <p className="mt-1 text-sm text-slate-600">
        <b>{who}</b> · {event}
      </p>

      <div className="mx-auto mt-5 max-w-xs">
        <Steps
          steps={[
            { label: "Pendaftaran kehadiran diterima", state: "done" },
            { label: "Menunggu persetujuan penyelenggara", state: "current" },
            { label: maskedEmail ? "Sertifikat dikirim ke email Anda" : "Sertifikat dapat diunduh di halaman ini", state: "todo" },
          ]}
        />
      </div>

      {maskedEmail ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-3 text-left text-sm text-slate-700">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p>
            Setelah disetujui, tautan sertifikat akan <b>dikirim ke email Anda</b> (<span className="font-medium">{maskedEmail}</span>). Periksa juga folder spam bila email belum masuk.
          </p>
        </div>
      ) : (
        <p className="mt-6 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Simpan halaman ini dan buka kembali nanti untuk melihat status serta mengunduh sertifikat setelah disetujui.</p>
      )}
    </div>
  );
}

export function RejectedCard({ org }: { org: string }) {
  return (
    <div className="card text-center">
      <XCircle className="mx-auto h-10 w-10 text-red-500" />
      <h1 className="mt-3 text-xl font-semibold">Pendaftaran tidak disetujui</h1>
      <p className="mt-1 text-sm text-slate-600">Hubungi penyelenggara ({org}) untuk informasi lebih lanjut.</p>
    </div>
  );
}

/** Sertifikat pernah terbit tetapi dicabut penyelenggara: verifikasi QR tetap menjelaskan statusnya. */
export function RevokedCard({ who, org, event, certNumber, revokedOn }: { who: string; org: string; event: string; certNumber: string | null; revokedOn: string | null }) {
  return (
    <div className="card text-center">
      <ShieldAlert className="mx-auto h-11 w-11 text-red-600" />
      <h1 className="mt-3 text-xl font-semibold text-red-700">Sertifikat ini telah dicabut</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Sertifikat atas nama <b className="text-slate-900">{who}</b> untuk kegiatan <b>{event}</b> yang diterbitkan oleh {org} sudah <b>tidak berlaku</b>
        {revokedOn ? ` sejak ${revokedOn}` : ""}. Hubungi penyelenggara untuk informasi lebih lanjut.
      </p>
      {certNumber && <p className="mt-3 font-mono text-xs text-slate-500">No. {certNumber}</p>}
    </div>
  );
}

export function InvalidCard() {
  return (
    <div className="card text-center">
      <XCircle className="mx-auto h-10 w-10 text-slate-400" />
      <h1 className="mt-3 text-xl font-semibold">Sertifikat tidak ditemukan</h1>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
        Tautan atau kode QR ini tidak terdaftar: salah ketik, atau datanya telah dihapus oleh penyelenggara. Hubungi penyelenggara kegiatan untuk memastikan.
      </p>
    </div>
  );
}
