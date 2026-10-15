// Tampil seketika saat berpindah halaman di dashboard, sementara data dimuat.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <div className="h-36 rounded-2xl bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-slate-200/60" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-56 rounded-2xl bg-slate-200/60" />)}
      </div>
    </div>
  );
}
