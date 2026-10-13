"use client";

import { Check, Download, Lock, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import LazyMount from "@/components/LazyMount";
import type { CertContext } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";
import { chooseTemplate, switchToTemplate } from "../../../actions";
import type { DesignDTO } from "@/lib/designs";
import DesignsPanel from "./DesignsPanel";

type Tpl = { id: string; name: string; tier: "free" | "pro"; layout: Layout };

type Props = {
  programId: string;
  userId: string;
  isPro: boolean;
  mode: "template" | "custom";
  templateId: string;
  templates: Tpl[];
  designs: DesignDTO[];
  activeDesignId: string | null;
  sample: CertContext;
  fields: { id: string; label: string }[];
};

export default function DesignClient(p: Props) {
  const [tab, setTab] = useState<"template" | "custom">(p.mode);
  const [mode, setMode] = useState(p.mode);
  const [activeId, setActiveId] = useState(p.templateId);
  const [designs, setDesigns] = useState(p.designs);
  const [activeDesignId, setActiveDesignId] = useState(p.activeDesignId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Tpl | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [, start] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  function use(t: Tpl) {
    setBusyId(t.id);
    start(async () => {
      const r = await chooseTemplate(p.programId, t.id);
      setBusyId(null);
      if (r.error) return setToast({ ok: false, text: r.error });
      setActiveId(t.id);
      setMode("template");
      setPreview(null);
      setToast({ ok: true, text: `Template "${t.name}" dipakai.` });
    });
  }

  const activeName = mode === "custom" ? `Desain: ${designs.find((d) => d.id === activeDesignId)?.name ?? "sendiri"}` : p.templates.find((t) => t.id === activeId)?.name;

  return (
    <div>
      {/* Bar tetap: tetap terlihat saat menggulir daftar template */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
            <button className={`rounded-md px-3 py-1.5 ${tab === "template" ? "bg-brand-600 text-white" : "text-slate-600"}`} onClick={() => setTab("template")}>Template</button>
            <button className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${tab === "custom" ? "bg-brand-600 text-white" : "text-slate-600"}`} onClick={() => setTab("custom")}>
              Desain sendiri
            </button>
          </div>
          <p className="hidden min-w-0 flex-1 truncate text-sm text-slate-600 sm:block">
            Dipakai: <b className="text-slate-900">{activeName}</b>
          </p>
          <div className="flex items-center gap-2">
            {toast && (
              <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium ${toast.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {toast.ok && <Check className="h-3.5 w-3.5" />} {toast.text}
              </span>
            )}
            <a href={`/api/programs/${p.programId}/sample`} target="_blank" className="btn btn-sm"><Download className="h-4 w-4" /> Contoh PDF</a>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {tab === "template" ? (
          <>
            {!p.isPro && <p className="text-sm text-slate-500">Template bertanda Pro terkunci pada paket Free.</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.templates.map((t) => {
                const locked = t.tier === "pro" && !p.isPro;
                const active = mode === "template" && t.id === activeId;
                return (
                  <div key={t.id} className={`overflow-hidden rounded-xl border bg-white ${active ? "border-brand-600 ring-2 ring-brand-100" : "border-slate-200"}`}>
                    <button type="button" className={`block w-full text-left ${locked ? "opacity-60" : "cursor-zoom-in"}`} onClick={() => setPreview(t)} aria-label={`Lihat ${t.name}`}>
                      <LazyMount><CertificateSvg layout={t.layout} className="block h-auto w-full" /></LazyMount>
                    </button>
                    <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        <span className={`badge mt-1 ${t.tier === "pro" ? "badge-pro" : ""}`}>{t.tier === "pro" ? "Pro" : "Free"}</span>
                      </div>
                      {active ? (
                        <span className="btn btn-sm cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"><Check className="h-4 w-4" /> Dipakai</span>
                      ) : locked ? (
                        <span className="btn btn-sm cursor-not-allowed opacity-60"><Lock className="h-3.5 w-3.5" /> Pro</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" disabled={busyId !== null} onClick={() => use(t)}>
                          {busyId === t.id ? "Memproses…" : "Gunakan"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {mode === "custom" && (
              <button
                className="btn"
                onClick={() => start(async () => { const r = await switchToTemplate(p.programId); if (!r.error) { setMode("template"); setToast({ ok: true, text: "Kembali memakai template." }); } })}
              >
                Kembali memakai template
              </button>
            )}
          </>
        ) : (
          <DesignsPanel
            programId={p.programId}
            userId={p.userId}
            isPro={p.isPro}
            designs={designs}
            activeId={mode === "custom" ? activeDesignId : null}
            sample={p.sample}
            fields={p.fields}
            onDesignsChange={setDesigns}
            onActiveChange={(id) => {
              setActiveDesignId(id);
              setMode(id ? "custom" : "template");
            }}
          />
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={() => setPreview(null)} role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CertificateSvg layout={preview.layout} className="block h-auto w-full" />
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <div>
                <p className="font-medium">{preview.name}</p>
                <span className={`badge ${preview.tier === "pro" ? "badge-pro" : ""}`}>{preview.tier === "pro" ? "Pro" : "Free"}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => setPreview(null)}><X className="h-4 w-4" /> Tutup</button>
                {mode === "template" && preview.id === activeId ? (
                  <span className="btn cursor-default border-emerald-200 bg-emerald-50 text-emerald-700"><Check className="h-4 w-4" /> Dipakai</span>
                ) : preview.tier === "pro" && !p.isPro ? (
                  <span className="btn cursor-not-allowed opacity-60"><Lock className="h-4 w-4" /> Khusus Pro</span>
                ) : (
                  <button className="btn btn-primary" disabled={busyId !== null} onClick={() => use(preview)}>{busyId === preview.id ? "Memproses…" : "Gunakan template ini"}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
