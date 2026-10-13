const BRAND = "Sertifikat Online";

const C = { brand: "#4f46e5", ink: "#0f172a", body: "#334155", muted: "#64748b", faint: "#94a3b8", line: "#e2e8f0", bg: "#f1f5f9", panel: "#f8fafc" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

type Shell = {
  preheader: string;
  title: string;
  /** HTML isi (sudah di-escape oleh pemanggil) */
  body: string;
  button: { label: string; url: string };
  /** kotak catatan (keamanan / masa berlaku) */
  note?: { heading: string; text: string };
  /** teks polos */
  plain: string;
};

function shell(o: Shell, siteHost: string) {
  const note = o.note
    ? `<tr><td style="padding:0 40px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border:1px solid ${C.line};border-left:3px solid ${C.brand};border-radius:6px">
          <tr><td style="padding:14px 16px;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.body}"><b style="color:${C.ink}">${o.note.heading}</b><br>${o.note.text}</td></tr>
        </table></td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="id"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(o.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.bg}">${escapeHtml(o.preheader)}${"&#8199;&#847;&zwnj;&nbsp;".repeat(90)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${C.line};border-radius:12px;overflow:hidden">
    <tr><td style="height:4px;line-height:4px;font-size:0;background:${C.brand}">&nbsp;</td></tr>
    <tr><td style="padding:28px 40px 4px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:${C.brand};border-radius:8px;font-family:${FONT};font-size:18px;font-weight:700;color:#ffffff;line-height:36px">S</td>
        <td style="padding-left:12px;font-family:${FONT};font-size:17px;font-weight:700;color:${C.ink};letter-spacing:-0.2px">${BRAND}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:24px 40px 0;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:700;color:${C.ink};letter-spacing:-0.3px">${o.title}</td></tr>
    <tr><td style="padding:14px 40px 0;font-family:${FONT};font-size:15px;line-height:1.7;color:${C.body}">${o.body}</td></tr>
    <tr><td style="padding:28px 40px 28px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td align="center" bgcolor="${C.brand}" style="border-radius:8px;background:${C.brand}"><a href="${o.button.url}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px">${o.button.label}</a></td>
      </tr></table>
    </td></tr>
    ${note}
    <tr><td style="padding:0 40px 28px;font-family:${FONT};font-size:12px;line-height:1.7;color:${C.muted}">Tombol tidak berfungsi? Salin dan tempel tautan berikut ke browser Anda:<br><a href="${o.button.url}" target="_blank" style="color:${C.brand};word-break:break-all;text-decoration:underline">${o.button.url}</a></td></tr>
    <tr><td style="padding:0 40px"><div style="height:1px;line-height:1px;font-size:0;background:${C.line}">&nbsp;</div></td></tr>
    <tr><td style="padding:20px 40px 28px;font-family:${FONT};font-size:12px;line-height:1.7;color:${C.faint}">
      Email ini dikirim otomatis oleh ${BRAND}. Mohon tidak membalas email ini.<br>
      ${siteHost} &nbsp;·&nbsp; © ${new Date().getFullYear()} ${BRAND}
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = `${o.plain}\n\n${o.button.label}:\n${o.button.url}\n\n${o.note ? `${o.note.heading}: ${o.note.text.replace(/<[^>]+>/g, "")}\n\n` : ""}--\nEmail ini dikirim otomatis oleh ${BRAND}. Mohon tidak membalas email ini.\n${siteHost}`;
  return { html, text };
}

function host() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "") || "sertifikat-online.vercel.app";
}

export function confirmEmail(name: string | null, email: string, url: string) {
  const who = name ? `Yth. <b>${escapeHtml(name)}</b>,` : "Halo,";
  return {
    subject: `Konfirmasi pendaftaran akun ${BRAND}`,
    ...shell(
      {
        preheader: "Satu langkah lagi untuk mengaktifkan akun Anda.",
        title: "Konfirmasi alamat email Anda",
        body: `<p style="margin:0 0 14px">${who}</p>
          <p style="margin:0 0 14px">Terima kasih telah mendaftar di ${BRAND}. Untuk menyelesaikan pendaftaran dan mengaktifkan akun, mohon konfirmasi bahwa alamat email <b style="color:${C.ink}">${escapeHtml(email)}</b> adalah milik Anda.</p>
          <p style="margin:0">Setelah dikonfirmasi, Anda dapat langsung membuat program dan menerbitkan sertifikat.</p>`,
        button: { label: "Konfirmasi Email", url },
        note: { heading: "Informasi keamanan", text: "Tautan ini berlaku selama 1 jam dan hanya dapat digunakan satu kali. Jika Anda tidak merasa mendaftar di " + BRAND + ", abaikan email ini; tidak ada tindakan lebih lanjut yang diperlukan." },
        plain: `${name ? `Yth. ${name},` : "Halo,"}\n\nTerima kasih telah mendaftar di ${BRAND}. Untuk mengaktifkan akun, mohon konfirmasi bahwa alamat email ${email} adalah milik Anda.`,
      },
      host(),
    ),
  };
}

export function resetEmail(email: string, url: string) {
  return {
    subject: `Permintaan atur ulang password ${BRAND}`,
    ...shell(
      {
        preheader: "Buat password baru untuk akun Anda.",
        title: "Atur ulang password",
        body: `<p style="margin:0 0 14px">Halo,</p>
          <p style="margin:0 0 14px">Kami menerima permintaan untuk mengatur ulang password akun ${BRAND} dengan alamat email <b style="color:${C.ink}">${escapeHtml(email)}</b>.</p>
          <p style="margin:0">Klik tombol di bawah untuk membuat password baru.</p>`,
        button: { label: "Buat Password Baru", url },
        note: { heading: "Bukan Anda yang meminta?", text: "Abaikan email ini, password Anda tidak akan berubah. Tautan berlaku selama 1 jam dan hanya dapat digunakan satu kali. Demi keamanan, jangan teruskan email ini kepada siapa pun." },
        plain: `Halo,\n\nKami menerima permintaan untuk mengatur ulang password akun ${BRAND} dengan alamat email ${email}.`,
      },
      host(),
    ),
  };
}

export function certificateIssuedEmail(o: { name: string | null; eventName: string; org: string; certType: string; certNumber: string | null; url: string }) {
  const rows = [
    ["Kegiatan", o.eventName],
    ["Penyelenggara", o.org],
    ["Jenis sertifikat", o.certType],
    ...(o.certNumber ? [["Nomor sertifikat", o.certNumber]] : []),
  ];
  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border:1px solid ${C.line};border-radius:8px">
    ${rows
      .map(
        ([k, v], i) =>
          `<tr><td style="padding:10px 14px;width:38%;font-size:13px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ""}">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ""}">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
  </table>`;
  return {
    subject: `Sertifikat Anda telah terbit – ${o.eventName}`,
    ...shell(
      {
        preheader: `Sertifikat ${o.certType} untuk ${o.eventName} sudah dapat diunduh.`,
        title: "Sertifikat Anda telah terbit",
        body: `<p style="margin:0 0 14px">${o.name ? `Yth. <b>${escapeHtml(o.name)}</b>,` : "Halo,"}</p>
          <p style="margin:0">Pendaftaran Anda telah disetujui dan sertifikat Anda sudah dapat diunduh dalam format PDF.</p>${table}`,
        button: { label: "Lihat & Unduh Sertifikat", url: o.url },
        note: { heading: "Verifikasi keaslian", text: "Setiap sertifikat memuat nomor unik dan kode QR. Siapa pun dapat memeriksa keasliannya melalui halaman sertifikat pada tautan di atas." },
        plain: `${o.name ? `Yth. ${o.name},` : "Halo,"}\n\nPendaftaran Anda telah disetujui dan sertifikat Anda sudah dapat diunduh.\n\nKegiatan: ${o.eventName}\nPenyelenggara: ${o.org}\nJenis sertifikat: ${o.certType}${o.certNumber ? `\nNomor sertifikat: ${o.certNumber}` : ""}`,
      },
      host(),
    ),
  };
}
