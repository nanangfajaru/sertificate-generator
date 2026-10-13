import type { Layout } from "./certificate/types";

export type Plan = "free" | "pro";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  plan_expires_at: string | null;
  is_admin: boolean;
};

export type Program = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  org_name: string;
  cert_type: string;
  description: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  number_format: string;
  cert_seq: number;
  signer1_name: string | null;
  signer1_title: string | null;
  signer2_name: string | null;
  signer2_title: string | null;
  approval_mode: "auto" | "manual";
  is_open: boolean;
  cert_mode: "template" | "custom";
  template_id: string;
  mapping: Record<string, string | null>;
  show_qr: boolean;
  notify_email: boolean;
  design_path: string | null;
  design_preview_path: string | null;
  design_kind: "pdf" | "png" | "jpg" | null;
  design_layout: Layout | null;
  created_at: string;
};

export type FieldType = "text" | "email" | "tel" | "number" | "date" | "textarea" | "select";

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Teks singkat" },
  { value: "email", label: "Email" },
  { value: "tel", label: "No. HP" },
  { value: "number", label: "Angka" },
  { value: "date", label: "Tanggal" },
  { value: "textarea", label: "Teks panjang" },
  { value: "select", label: "Pilihan" },
];

export type ProgramField = {
  id: string;
  program_id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  sort: number;
};

export type Participant = {
  id: string;
  program_id: string;
  code: string;
  data: Record<string, string>;
  status: "pending" | "approved" | "rejected" | "revoked";
  cert_number: string | null;
  created_at: string;
  approved_at: string | null;
  emailed_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
};

export const FREE_PROGRAM_LIMIT = 5;

export function isProProfile(p: Pick<Profile, "plan" | "plan_expires_at"> | null | undefined) {
  if (!p || p.plan !== "pro") return false;
  return !p.plan_expires_at || new Date(p.plan_expires_at) > new Date();
}
