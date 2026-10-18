// Render animasi HTML (yang mengekspos window.render(t)) menjadi frame JPG lalu MP4.
// Pakai: node marketing/video/render.js <file.html> <detik> <out.mp4> [audio.wav]
//        node marketing/video/render.js <file.html> stills 1.5,7,20   (cek beberapa frame)
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const [, , file, dur, out, audio] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.resolve(file));
  await p.waitForTimeout(500);
  if (dur === "stills") {
    for (const t of out.split(",")) { await p.evaluate((t) => render(+t), t); await p.screenshot({ path: `still_${t}.jpg`, type: "jpeg", quality: 80 }); }
  } else {
    const dir = fs.mkdtempSync("/tmp/frames-");
    const n = Math.round(+dur * 30);
    for (let i = 0; i < n; i++) { await p.evaluate((t) => render(t), i / 30); await p.screenshot({ path: `${dir}/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 }); }
    const args = ["-y", "-loglevel", "error", "-framerate", "30", "-i", `${dir}/f%04d.jpg`];
    if (audio) args.push("-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest");
    args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", out);
    execFileSync("ffmpeg", args);
    fs.rmSync(dir, { recursive: true });
  }
  await b.close();
})();
