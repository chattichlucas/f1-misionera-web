import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role. SOLO servidor. Ignora RLS.
 * Usar con cuidado y únicamente en rutas/acciones ya protegidas por auth.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return createSbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
