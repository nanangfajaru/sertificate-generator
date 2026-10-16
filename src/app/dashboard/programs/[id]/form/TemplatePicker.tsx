"use client";

import { Check, Crown, LayoutTemplate, Lock, Palette, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import LazyMount from "@/components/LazyMount";
import { brandLayout } from "@/lib/certificate/branding";
import { resolveLayout, type CertContext } from "@/lib/certificate/sources";
import { TEMPLATE_GROUPS, templateGroup, type TemplateGroupKey } from "@/lib/certificate/template-groups";
import { TEMPLATES } from "@/lib/certificate/templates";
import type { DesignDTO } from "@/lib/designs";
import type { Layout } from "@/lib/certificate/types";

/** Pilihan beserta layout pratinjaunya (sudah terisi data contoh), agar pemanggil tak perlu memuat data template. */
export type PickerChoice = { kind: "template" | "design"; id: string; name: string; layout: Layout; bg: string | null };

type Props = {
  isPro: boolean;
  sample: CertContext;
  images: Record<string, string>;
  current: { mode: "template" | "custom"; templateId: string; designId: string | null };
  designs: DesignDTO[];
  onClose: () => void;
  /** memasang pilihan; kembalikan { error } bila gagal. Popup tertutup sendiri bila berhasil. */
  onChoose: (c: PickerChoice) => Promise<{ error?: string } | void>;
};

/** Popup memilih template bawaan atau desain sendiri untuk program, tanpa meninggalkan halaman. */
export default function TemplatePicker({ isPro, sample, images, current, designs, onClose, onChoose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"template" | "custom">(current.mode);
  const [group, setGroup] = useState<"all" | TemplateGroupKey>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const templates = useMemo(
    () => TEMPLATES.map((t) => ({ id: t.id, name: t.name, tier: t.tier, layout: brandLayout(resolveLayout(t.layout, sample), { certMode: "template", templateId: t.id, logo: true, sig1: !!images.sig1, sig2: !!images.sig2 }) })),
    [sample, images.sig1, images.sig2],
  );
  const visible = group === "all" ? templates : templates.filter((t) => templateGroup(t.id) === group);

  function pick(c: PickerChoice) {
    setErr(null);
    setBusy(c.id);
    start(async () => {
      const r = await onChoose(c);
      setBusy(null);
      if (r?.error) return setErr(r.error);
      onClose();
    });
  }

  const tabBtn = (k: "template" | "custom", icon: React.ReactNode, label: React.ReactNode) => (
    <button type="button" onClick={() => setTab(k)} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === k ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Pilih sertifikat">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="font-semibold">Pilih sertifikat</p>
            <p className="text-xs text-slate-500">Klik salah satu untuk langsung dipakai. Bisa diganti lagi kapan saja.</p>
          </div>
          <button type="button" className="btn btn-sm !px-2" onClick={onClose} aria-label="Tutup"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3 border-b border-slate-100 px-4 py-3">
          <div className="inline-grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1">
            {tabBtn("template", <LayoutTemplate className="h-4 w-4" />, "Template")}
            {tabBtn("custom", <Palette className="h-4 w-4" />, <>Desain sendiri <Crown className={`h-3 w-3 ${tab === "custom" ? "text-amber-200" : "text-amber-500"}`} /></>)}
          </div>
          {tab === "template" && (
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ key: "all" as const, label: "Semua" }, ...TEMPLATE_GROUPS.map((g) => ({ key: g.key, label: g.label }))].map((g) => (
                <button key={g.key} type="button" onClick={() => setGroup(g.key)} className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition ${group === g.key ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{g.label}</button>
              ))}
            </div>
          )}
          {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
          {tab === "template" ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((t) => {
                const locked = t.tier === "pro" && !isPro;
                const active = current.mode === "template" && current.templateId === t.id;
                const choose = () => {
                  if (locked) return router.push("/dashboard/upgrade");
                  if (!active && busy === null) pick({ kind: "template", id: t.id, name: t.name, layout: t.layout, bg: null });
                };
                return (
                  <Card key={t.id} name={t.name} active={active} busy={busy === t.id} disabled={busy !== null} locked={locked} pro={t.tier === "pro"} onChoose={choose}>
                    <div className={locked ? "opacity-60" : undefined}>
                      <LazyMount><CertificateSvg layout={t.layout} images={images} logoPlaceholder={!images.logo} className="block h-auto w-full" /></LazyMount>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : !isPro ? (
            <div className="mx-auto max-w-md py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700"><Crown className="h-6 w-6" /></span>
              <p className="mt-3 font-semibold">Desain sendiri khusus paket Pro</p>
              <p className="mt-1 text-sm text-slate-600">Unggah desain dari Canva atau Photoshop dan pakai untuk sertifikat program.</p>
              <Link href="/dashboard/upgrade" className="btn btn-primary mt-4"><Crown className="h-4 w-4" /> Upgrade ke Pro</Link>
            </div>
          ) : designs.length === 0 ? (
            <div className="mx-auto max-w-md py-10 text-center">
              <p className="font-semibold">Belum ada desain sendiri</p>
              <p className="mt-1 text-sm text-slate-600">Unggah dan atur desain di menu <b>Template → Desain sendiri</b>, lalu pilih di sini.</p>
              <Link href="/dashboard/templates?tab=custom" target="_blank" className="btn mt-4">Buka menu Template</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {designs.map((d) => {
                const active = current.mode === "custom" && current.designId === d.id;
                const choose = () => { if (!active && busy === null) pick({ kind: "design", id: d.id, name: `Desain sendiri: ${d.name}`, layout: resolveLayout(d.layout, sample), bg: d.previewUrl }); };
                return (
                  <Card key={d.id} name={d.name} active={active} busy={busy === d.id} disabled={busy !== null} onChoose={choose}>
                    <LazyMount aspect={`${d.layout.width} / ${d.layout.height}`}>
                      <CertificateSvg layout={resolveLayout(d.layout, sample)} backgroundUrl={d.previewUrl} images={images} logoPlaceholder={!images.logo} className="block h-full w-full" />
                    </LazyMount>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Kartu pilihan: klik gambar atau tombol "Gunakan" sama-sama memilih; yang terpilih bertanda centang. */
function Card({ name, active, busy, disabled, locked, pro, onChoose, children }: {
  name: string;
  active: boolean;
  busy: boolean;
  disabled: boolean;
  locked?: boolean;
  pro?: boolean;
  onChoose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-white transition ${active ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-400 hover:shadow-md"}`}>
      <button type="button" className="block w-full text-left disabled:cursor-default" onClick={onChoose} disabled={active || (disabled && !locked)} aria-label={`Pilih ${name}`}>
        {children}
      </button>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-2.5 py-2">
        <span className="flex min-w-0 items-center gap-1 text-xs font-medium">
          <span className="truncate">{name}</span>
          {pro && !locked && <Crown className="h-3 w-3 shrink-0 text-amber-500" />}
        </span>
        {active ? (
          <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-xs font-semibold text-emerald-700"><Check className="h-3.5 w-3.5" /> Dipakai</span>
        ) : locked ? (
          <button type="button" onClick={onChoose} className="btn btn-sm h-7 shrink-0 !px-2 text-xs"><Lock className="h-3 w-3" /> Pro</button>
        ) : (
          <button type="button" onClick={onChoose} disabled={disabled} className="btn btn-primary btn-sm h-7 shrink-0 !px-2.5 text-xs">{busy ? "…" : "Gunakan"}</button>
        )}
      </div>
    </div>
  );
}
