/** Hiasan bulatan untuk header navy (tidak memotong menu dropdown karena overflow hanya di lapisan ini). */
export default function HeaderMotif() {
  return (
    <div className="header-motif" aria-hidden>
      <span className="absolute -left-10 -top-14 h-36 w-36 rounded-full bg-white/[0.04]" />
      <span className="absolute left-[46%] -top-6 h-14 w-14 rounded-full border border-amber-300/25" />
      <span className="absolute right-[26%] -bottom-10 h-24 w-24 rounded-full bg-brand-500/20" />
      <span className="absolute right-[2%] top-3 h-3 w-3 rounded-full bg-amber-300/40" />
      <span className="absolute left-[18%] bottom-2 h-2 w-2 rounded-full bg-white/25" />
    </div>
  );
}
