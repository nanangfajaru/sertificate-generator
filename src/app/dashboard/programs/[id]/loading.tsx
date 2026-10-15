// Header program dan tab tetap tampil (dari layout); hanya isi tab yang menampilkan kerangka ini.
export default function Loading() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-3" aria-busy="true">
      <div className="h-96 rounded-2xl bg-slate-200/60 lg:col-span-2" />
      <div className="space-y-6">
        <div className="h-40 rounded-2xl bg-slate-200/60" />
        <div className="h-32 rounded-2xl bg-slate-200/60" />
      </div>
    </div>
  );
}
