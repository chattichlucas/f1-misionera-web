import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

type Maint = { on: boolean; message: string | null };

let cached: { value: Maint; at: number } | null = null;
const TTL_MS = 30_000;

/** Lee el flag de mantenimiento vía REST, cacheado 30s en memoria del contenedor. */
export async function getMaintenance(): Promise<Maint> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { on: false, message: null };
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=maintenance_mode,maintenance_message`,
      {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        cache: "no-store",
      },
    );
    const rows = (await res.json()) as Array<{
      maintenance_mode?: boolean;
      maintenance_message?: string | null;
    }>;
    const row = Array.isArray(rows) ? rows[0] : undefined;
    const value: Maint = {
      on: Boolean(row?.maintenance_mode),
      message: row?.maintenance_message ?? null,
    };
    cached = { value, at: Date.now() };
    return value;
  } catch {
    return { on: false, message: null };
  }
}
