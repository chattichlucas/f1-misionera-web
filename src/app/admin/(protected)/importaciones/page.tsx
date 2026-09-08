import { createClient } from "@/lib/supabase/server";
import { getMyPermissions, canView } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ImportacionesPage() {
  const mp = await getMyPermissions();
  if (!canView(mp, "session_results")) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Importaciones</h1>
        <p className="mt-2 text-sm text-muted">Necesitás acceso al módulo Resultados.</p>
      </div>
    );
  }

  const sb = await createClient();
  const { data } = await sb
    .from("import_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const logs = data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Importaciones de resultados</h1>
      <p className="text-sm text-muted">
        Registro de cada llamada a <code>/api/import/classification</code>. Últimas 50.
      </p>

      {logs.length === 0 ? (
        <p className="panel p-6 text-sm text-muted">Todavía no hubo importaciones.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const row = l as {
              id: string;
              created_at: string;
              round_label: string | null;
              session: string | null;
              ok: boolean;
              message: string | null;
              imported: number;
              matched: string[];
              unmatched: string[];
              source_ip: string | null;
              forced: boolean;
            };
            return (
              <div key={row.id} className="panel p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">
                    {row.round_label ?? "—"}
                    <span className="text-muted"> · {row.session}</span>
                  </p>
                  <span
                    className="chip"
                    style={{ borderColor: row.ok ? "var(--positive)" : "var(--negative)" }}
                  >
                    {row.ok ? `OK · ${row.imported}` : "Error"}
                  </span>
                </div>
                <p className="mt-1 text-muted">{row.message}</p>
                {row.unmatched?.length > 0 && (
                  <p className="mt-1 text-negative">
                    Sin coincidencia: {row.unmatched.join(", ")}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {formatDateTime(row.created_at)} · {row.source_ip}
                  {row.forced ? " · forzado" : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
