import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service role: melewati RLS. Hanya untuk kode server (halaman publik peserta, generate PDF).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
