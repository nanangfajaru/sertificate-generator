import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { isProProfile, type Profile } from "./db";

export const getSessionProfile = cache(async () => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (!data) return null;
  const profile = data as Profile;
  return { supabase, profile, isPro: isProProfile(profile) };
});

export async function requireUser() {
  const s = await getSessionProfile();
  if (!s) redirect("/login");
  return s;
}

/** Khusus admin owner; selain admin mendapat 404 agar halaman tidak terlihat ada. */
export async function requireAdmin() {
  const s = await requireUser();
  if (!s.profile.is_admin) notFound();
  return s;
}
