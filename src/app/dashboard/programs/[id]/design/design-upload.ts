import { createClient } from "@/lib/supabase/client";

export const MAX_DESIGN_BYTES = 10 * 1024 * 1024;

export type ReadDesign = { kind: "pdf" | "png" | "jpg"; preview: Blob; width: number; height: number };

/** Membaca file desain: PDF dirender halaman pertamanya jadi PNG pratinjau; gambar dipakai apa adanya. */
export async function readDesign(file: File): Promise<ReadDesign> {
  if (file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: Math.min(3, 2000 / base.width) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
    const preview = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("canvas"))), "image/png"));
    return { kind: "pdf", preview, width: base.width, height: base.height };
  }
  if (file.type === "image/png" || file.type === "image/jpeg") {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("img"));
      i.src = url;
    });
    URL.revokeObjectURL(url);
    return { kind: file.type === "image/png" ? "png" : "jpg", preview: file, width: img.naturalWidth, height: img.naturalHeight };
  }
  throw new Error("Format harus PDF, PNG, atau JPG");
}

/** Mengunggah file asli + pratinjau ke bucket "designs" milik pengguna. */
export async function uploadDesignFiles(userId: string, programId: string, file: File, d: ReadDesign) {
  const sb = createClient();
  const base = `${userId}/${programId}/${crypto.randomUUID()}`;
  const path = `${base}.${d.kind}`;
  const previewPath = `${base}-preview.${d.kind === "jpg" ? "jpg" : "png"}`;
  const up1 = await sb.storage.from("designs").upload(path, file, { contentType: file.type });
  if (up1.error) throw new Error(up1.error.message);
  const up2 = await sb.storage.from("designs").upload(previewPath, d.preview, { contentType: d.kind === "jpg" ? "image/jpeg" : "image/png" });
  if (up2.error) {
    await sb.storage.from("designs").remove([path]);
    throw new Error(up2.error.message);
  }
  return { path, previewPath, kind: d.kind, width: d.width, height: d.height };
}
