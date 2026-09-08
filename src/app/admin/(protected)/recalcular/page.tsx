import { getRounds } from "@/lib/data";
import { getMyPermissions, canEdit } from "@/lib/permissions";
import { RecalcTool } from "./tool";

export const dynamic = "force-dynamic";

export default async function RecalcularPage() {
  const mp = await getMyPermissions();
  if (!canEdit(mp, "session_results")) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Recalcular carrera</h1>
        <p className="mt-2 text-sm text-muted">Necesitás permiso de edición en Resultados.</p>
      </div>
    );
  }

  const rounds = await getRounds();
  const options = rounds
    .filter((r) => r.status !== "cancelado")
    .sort((a, b) => b.round_number - a.round_number)
    .map((r) => ({
      id: r.id,
      label: `R${r.round_number} · ${r.circuit?.name ?? "?"} · ${r.category?.name ?? ""}`,
      is_sprint: r.is_sprint,
    }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Recalcular carrera</h1>
      <p className="text-sm text-muted">
        Reordena la clasificación por <b>tiempo total + penalizaciones de tiempo</b> y
        recalcula los puntos. Cargá el tiempo de cada piloto en Resultados y la
        penalización en segundos en Penalizaciones.
      </p>
      <RecalcTool rounds={options} />
    </div>
  );
}
