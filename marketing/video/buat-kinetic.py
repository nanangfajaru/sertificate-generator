"""Buat file HTML video dari template kinetic.html + konfigurasi adegan.
Pakai: python3 marketing/video/buat-kinetic.py  (menulis marketing/video/k-*.html)"""
import json, pathlib
D = pathlib.Path(__file__).parent
TPL = (D / "kinetic.html").read_text()

def it(html, top, t0, t1=None, cls="", fx="up", **kw):
    d = dict(html=html, top=top + 230, t0=t0, t1=t1, cls=cls, fx=fx); d.update(kw); return d

VIDEOS = {
  # K2 · POV Panitia: jam 2 pagi
  "k2-pov-jam-2-pagi": dict(dur=15, end=3, items=[
    it('<span class="tag">POV PANITIA</span>', 360, .1, 3.2, fx="pop"),
    it('Jam 2 pagi.<br>Kamu sie sekret.', 560, .3, 3.2, cls="big"),
    it('Sertifikat peserta<br>belum jadi 🫠', 860, 1.3, 3.2, cls="mid gold"),
    it('<div class="card"><small>Peserta ke-247</small>Aisyah Putri <span class="red" style="text-decoration:line-through">Rhama</span> Rahma</div>', 640, 3.5, 6.3, fx="pop"),
    it('typo lagi…', 900, 4.4, 6.3, cls="mid red"),
    it('<div class="bubble"><b>Peserta 12</b>kak sertifikatnya kapan? 🥲</div>', 480, 6.6, 9.4, fx="left", style="text-align:left"),
    it('<div class="bubble"><b>Peserta 88</b>kak nama saya salah</div>', 700, 7.3, 9.4, fx="left", style="text-align:left"),
    it('<div class="bubble"><b>Peserta 201</b>kak link-nya mati 😭</div>', 920, 8.0, 9.4, fx="left", style="text-align:left"),
    it('Padahal bisa gini:', 420, 9.6, 12.0, cls="mid gold"),
    it('<div class="li">① Bagikan 1 link</div><div class="li">② Peserta isi nama sendiri</div><div class="li">③ Sertifikat langsung jadi ✅</div>', 600, 10.0, 12.0, cls="", style="text-align:left;left:150px;right:150px"),
  ]),
  # K3 · Panitia A vs B
  "k3-panitia-a-vs-b": dict(dur=15, end=3, items=[
    it('Panitia A <span class="red">lembur</span>.<br>Panitia B <span class="green">pulang cepat</span>.', 560, .2, 3.0, cls="big"),
    it('Bedanya cuma satu.', 900, 1.2, 3.0, cls="mid gold"),
    it('<div style="display:flex;gap:30px;text-align:left"><div style="flex:1"><h3 style="font-size:58px;text-align:center;margin-bottom:36px" class="red">Panitia A</h3><div class="li">Ketik 300 nama</div><div class="li">Ekspor 300 PDF</div><div class="li">Kirim satu-satu</div><div class="clock red">02.00</div></div><div style="flex:1"><h3 style="font-size:58px;text-align:center;margin-bottom:36px" class="green">Panitia B</h3><div class="li">Bagikan 1 link</div><div class="li">Peserta isi sendiri</div><div class="li">Sertifikat terbit ✅</div><div class="clock green">21.00</div></div></div>', 360, 3.3, 9.6, fx="pop", style="left:60px;right:60px"),
    it('Kamu tim <span class="red">A</span> atau <span class="green">B</span>?', 620, 9.9, 12.0, cls="big"),
    it('Jawab di komen 👇', 880, 10.4, 12.0, cls="mid gold"),
  ]),
  # K4 · Cek Dulu: QR verifikasi
  "k4-cek-dulu-qr": dict(dur=14, end=3, items=[
    it('<span class="tag">CEK DULU</span>', 360, .1, 2.8, fx="pop"),
    it('Sertifikat ini<br><span class="gold">asli</span> atau <span class="red">editan</span>?', 560, .3, 2.8, cls="big"),
    it('<img src="cert.png" style="width:100%;border-radius:10px;box-shadow:0 40px 80px -25px rgba(0,0,0,.6)">', 560, 3.0, 6.2, fx="pop", style="left:80px;right:80px"),
    it('Pindai QR di pojok sertifikat', 1220, 3.6, 6.2, cls="mid"),
    it('<div class="card" style="border:4px solid #4ade80"><small>Hasil cek keaslian</small>✅ Sertifikat terdaftar<br><span style="font-size:34px;font-weight:400;color:#334155">Aisyah Putri Rahma · Seminar Nasional Teknologi 2026</span></div>', 620, 6.5, 10.6, fx="pop"),
    it('Nama, acara, dan nomor<br>langsung bisa dicocokkan.', 1000, 7.2, 10.6, cls="sm"),
    it('Sertifikat dari SertifikatKu<br>semuanya punya QR ini.', 1180, 8.4, 10.6, cls="mid gold"),
  ]),
}
for name, cfg in VIDEOS.items():
    html = TPL.split("/*CONFIG*/")[0] + "/*CONFIG*/" + json.dumps(cfg, ensure_ascii=False) + "/*END*/" + TPL.split("/*END*/")[1]
    (D / f"{name}.html").write_text(html)
    print("tulis", name)
