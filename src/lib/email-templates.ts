const BRAND = "Sertifikat Online";

function layout(title: string, intro: string, button: { label: string; url: string }, outro: string) {
  const html = `<!doctype html>
<html lang="id"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
      <tr><td style="padding:28px 32px 0;font-weight:700;font-size:16px;color:#4f46e5">${BRAND}</td></tr>
      <tr><td style="padding:16px 32px 0;font-size:20px;font-weight:700">${title}</td></tr>
      <tr><td style="padding:12px 32px 0;font-size:15px;line-height:1.6;color:#334155">${intro}</td></tr>
      <tr><td style="padding:24px 32px"><a href="${button.url}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px">${button.label}</a></td></tr>
      <tr><td style="padding:0 32px 8px;font-size:13px;line-height:1.6;color:#64748b">${outro}</td></tr>
      <tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.6;color:#94a3b8">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><span style="word-break:break-all">${button.url}</span></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `${title}\n\n${intro.replace(/<[^>]+>/g, "")}\n\n${button.label}: ${button.url}\n\n${outro}`;
  return { html, text };
}

export function confirmEmail(name: string | null, url: string) {
  return {
    subject: `Konfirmasi email Anda – ${BRAND}`,
    ...layout(
      "Konfirmasi email Anda",
      `Halo${name ? ` <b>${escapeHtml(name)}</b>` : ""}, terima kasih telah mendaftar. Klik tombol di bawah untuk mengaktifkan akun Anda.`,
      { label: "Konfirmasi email", url },
      "Tautan berlaku selama 1 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.",
    ),
  };
}

export function resetEmail(url: string) {
  return {
    subject: `Atur ulang password – ${BRAND}`,
    ...layout(
      "Atur ulang password",
      "Kami menerima permintaan untuk mengatur ulang password akun Anda. Klik tombol di bawah untuk membuat password baru.",
      { label: "Buat password baru", url },
      "Tautan berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini; password Anda tidak berubah.",
    ),
  };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
