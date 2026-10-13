import { InvalidCard } from "./StatusCards";

export const metadata = { title: "Tautan tidak berlaku", robots: { index: false } };

// Dipakai saat kode tidak ada: peserta/program sudah dihapus, atau tautan salah.
export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <InvalidCard />
      </div>
    </main>
  );
}
