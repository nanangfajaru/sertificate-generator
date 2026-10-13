import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import type { Participant, Program, ProgramField } from "@/lib/db";
import { formatExpiry, linkState } from "@/lib/link-validity";
import { siteUrl } from "@/lib/util";

const STATUS = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

// Cegah CSV/formula injection saat dibuka di Excel.
function cell(v: unknown) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });

  const { data: program } = await s.supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!program) return new NextResponse("Not found", { status: 404 });
  const p = program as Program;
  const { data: f } = await s.supabase.from("program_fields").select("*").eq("program_id", id).order("sort");
  const fields = (f ?? []) as ProgramField[];

  const rows: Participant[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await s.supabase.from("participants").select("*").eq("program_id", id).order("created_at").range(from, from + 999);
    rows.push(...((data ?? []) as Participant[]));
    if (!data || data.length < 1000) break;
  }

  const head = ["No", "Waktu daftar", ...fields.map((x) => x.label), "Status", "No. sertifikat", "Link sertifikat", "Tautan berlaku sampai"];
  const lines = [head.map(cell).join(",")];
  rows.forEach((r, i) => {
    lines.push(
      [
        i + 1,
        new Date(r.created_at).toISOString().replace("T", " ").slice(0, 19),
        ...fields.map((x) => r.data[x.id] ?? ""),
        STATUS[r.status],
        r.cert_number ?? "",
        (() => (linkState(r, p.link_valid_days).state === "valid" ? `${siteUrl()}/c/${r.code}` : r.status === "approved" ? "(kedaluwarsa)" : ""))(),
        (() => {
          const { state, expiry } = linkState(r, p.link_valid_days);
          return state !== "pending" && state !== "rejected" && expiry ? formatExpiry(expiry) : "";
        })(),
      ].map(cell).join(","),
    );
  });

  const name = p.name.replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "program";
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kehadiran-${name}.csv"`,
    },
  });
}
