import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RESOURCE_LIST } from "@/lib/admin/resources";

export const dynamic = "force-dynamic";

async function count(table: string) {
  const sb = await createClient();
  const { count } = await sb.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminHome() {
  const sb = await createClient();
  const { data: pending } = await sb
    .from("inscriptions")
    .select("id, full_name, gamertag, category_label, created_at")
    .eq("status", "pendiente")
    .order("created_at", { ascending: false })
    .limit(10);

  const counts = await Promise.all(
    RESOURCE_LIST.map(async (r) => [r, await count(r.table)] as const),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Resumen</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(([r, n]) => (
          <Link key={r.key} href={`/admin/manage/${r.key}`} className="panel p-4 hover:border-primary">
            <p className="text-sm text-muted">{r.label}</p>
            <p className="text-2xl font-extrabold">{n}</p>
          </Link>
        ))}
      </div>

      <div className="panel">
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--line)" }}>
          <h2 className="font-bold">Inscripciones pendientes</h2>
          <Link href="/admin/inscripciones" className="text-sm font-bold text-primary">
            Ver todas →
          </Link>
        </div>
        {!pending || pending.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No hay inscripciones pendientes.</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {pending.map((p) => (
              <li key={p.id} className="px-5 py-3 text-sm">
                <span className="font-semibold">{p.full_name}</span>{" "}
                <span className="text-muted">· {p.gamertag}</span>{" "}
                {p.category_label && <span className="text-muted">· {p.category_label}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
