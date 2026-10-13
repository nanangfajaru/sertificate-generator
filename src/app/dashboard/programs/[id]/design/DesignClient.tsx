"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import type { CertContext } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";
import { chooseTemplate, switchToTemplate } from "../../../actions";
import DesignEditor from "./DesignEditor";

type Props = {
  programId: string;
  userId: string;
  isPro: boolean;
  mode: "template" | "custom";
  templateId: string;
  templates: { id: string; name: string; tier: "free" | "pro"; layout: Layout }[];
  hasDesign: boolean;
  designLayout: Layout | null;
  designBgUrl: string | null;
  sample: CertContext;
  fields: { id: string; label: string }[];
};

export default function DesignClient(p: Props) {
  const [tab, setTab] = useState<"template" | "custom">(p.mode);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pick(id: string) {
    setMsg(null);
    start(async () => {
      const r = await chooseTemplate(p.programId, id);
      if (r.error) setMsg(r.error);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
          <button className={`rounded-md px-3 py-1.5 ${tab === "template" ? "bg-brand-600 text-white" : "text-slate-600"}`} onClick={() => setTab("template")}>Template</button>
          <button className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${tab === "custom" ? "bg-brand-600 text-white" : "text-slate-600"}`} onClick={() => setTab("custom")}>
            Desain sendiri {!p.isPro && <Lock className="h-3.5 w-3.5" />}
          </button>
        </div>
        <a href={`/api/programs/${p.programId}/sample`} target="_blank" className="btn btn-sm"><Download className="h-4 w-4" /> Contoh PDF</a>
      </div>

      {tab === "template" ? (
        <>
          <p className="text-sm text-slate-600">
            Aktif: <b>{p.mode === "custom" ? "Desain sendiri" : p.templates.find((t) => t.id === p.templateId)?.name}</b>.
            {!p.isPro && " Template Pro terkunci pada paket Free."}
          </p>
          {msg && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.templates.map((t) => {
              const locked = t.tier === "pro" && !p.isPro;
              const active = p.mode === "template" && t.id === p.templateId;
              return (
                <button
                  key={t.id}
                  disabled={locked || pending}
                  onClick={() => pick(t.id)}
                  className={`group relative overflow-hidden rounded-xl border bg-white text-left transition ${active ? "border-brand-600 ring-2 ring-brand-100" : "border-slate-200 hover:border-brand-500"} ${locked ? "cursor-not-allowed" : ""}`}
                >
                  <div className={locked ? "opacity-60" : ""}><CertificateSvg layout={t.layout} className="block h-auto w-full" /></div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium">{t.name}</span>
                    {active ? <span className="badge badge-ok">Dipakai</span> : t.tier === "pro" ? <span className="badge badge-pro">{locked && <Lock className="mr-1 h-3 w-3" />}Pro</span> : <span className="badge">Free</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {p.mode === "custom" && (
            <button className="btn" onClick={() => start(async () => { await switchToTemplate(p.programId); })}>Kembali memakai template</button>
          )}
        </>
      ) : p.isPro ? (
        <DesignEditor {...p} />
      ) : (
        <div className="card text-center">
          <Lock className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-2 font-semibold">Upload desain sendiri khusus paket Pro</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Upload PDF/PNG/JPG desain Anda, lalu atur posisi nama, tanggal, dan nomor sertifikat.</p>
          <Link href="/#harga" className="btn btn-primary mt-4">Lihat paket Pro</Link>
        </div>
      )}
    </div>
  );
}
