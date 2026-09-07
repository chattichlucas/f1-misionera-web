import { createClient } from "@/lib/supabase/server";
import { InscriptionRow } from "./row";
import type { Inscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInscripcionesPage() {
  const sb = await createClient();
  const { data } = await sb
    .from("inscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Inscription[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Inscripciones</h1>
      <p className="text-sm text-muted">{rows.length} solicitudes</p>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="panel p-6 text-sm text-muted">No hay inscripciones.</p>
        )}
        {rows.map((r) => (
          <InscriptionRow key={r.id} row={r} />
        ))}
      </div>
    </div>
  );
}
