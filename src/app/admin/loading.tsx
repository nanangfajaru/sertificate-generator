// Tampil seketika saat berpindah menu admin (menu samping tetap), sementara data dimuat.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <div className="h-8 w-48 rounded-lg bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[68px] rounded-xl bg-slate-200/60" />)}
      </div>
      <div className="h-10 rounded-lg bg-slate-200/60" />
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-200/50" />)}
      </div>
    </div>
  );
}
