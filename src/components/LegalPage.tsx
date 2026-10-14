import Logo from "./Logo";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-5">
          <Logo size={30} />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">Terakhir diperbarui: {updated}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">{children}</div>
      </main>
    </div>
  );
}
