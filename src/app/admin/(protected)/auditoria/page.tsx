import { createClient } from "@/lib/supabase/server";
import { getMyPermissions } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Borró",
  settings: "Ajustes",
  permissions: "Permisos",
  inscription: "Inscripción",
  recalc: "Recálculo",
  import: "Import",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; q?: string; action?: string }>;
}) {
  const mp = await getMyPermissions();
  if (!mp.superadmin) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Auditoría</h1>
        <p className="mt-2 text-sm text-muted">Solo para superadmins.</p>
      </div>
    );
  }

  const { from, to, q, action } = await searchParams;
  const sb = await createClient();

  let query = sb
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);
  if (action) query = query.eq("action", action);
  const safeQ = (q ?? "").replace(/[,()*%\\]/g, "").trim();
  if (safeQ)
    query = query.or(
      `actor_email.ilike.%${safeQ}%,summary.ilike.%${safeQ}%,entity.ilike.%${safeQ}%`,
    );

  const { data } = await query;
  const logs = data ?? [];

  const field = "rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm outline-none border";
  const st = { borderColor: "var(--line)" } as const;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Auditoría</h1>
      <p className="text-sm text-muted">Quién creó, editó o borró cosas en el panel.</p>

      <form className="panel flex flex-wrap items-end gap-3 p-4" method="get">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Desde</span>
          <input type="date" name="from" defaultValue={from} className={field} style={st} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Hasta</span>
          <input type="date" name="to" defaultValue={to} className={field} style={st} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Acción</span>
          <select name="action" defaultValue={action ?? ""} className={field} style={st}>
            <option value="">Todas</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Buscar (persona / cosa)</span>
          <input type="search" name="q" defaultValue={q} className={field} style={st} placeholder="email, módulo…" />
        </label>
        <button type="submit" className="btn btn-primary">Filtrar</button>
        <a href="/admin/auditoria" className="btn btn-ghost">Limpiar</a>
      </form>

      <div className="panel overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Quién</th>
              <th>Acción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">Sin movimientos.</td>
              </tr>
            )}
            {logs.map((l) => {
              const row = l as {
                id: string;
                created_at: string;
                actor_email: string | null;
                action: string;
                entity: string | null;
                summary: string | null;
              };
              return (
                <tr key={row.id}>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(row.created_at)}</td>
                  <td className="font-semibold">{row.actor_email ?? "—"}</td>
                  <td>
                    <span className="chip text-xs">{ACTION_LABEL[row.action] ?? row.action}</span>
                  </td>
                  <td>{row.summary ?? row.entity ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {logs.length === 300 && (
        <p className="text-xs text-muted">Se muestran los primeros 300. Afiná el filtro de fechas.</p>
      )}
    </div>
  );
}
