import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RESOURCES } from "@/lib/admin/resources";
import { ResourceManager } from "@/components/admin/resource-manager";
import { getMyPermissions, canView, canEdit } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const resource = RESOURCES[key];
  if (!resource) notFound();

  const mp = await getMyPermissions();
  if (!canView(mp, key)) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">{resource.label}</h1>
        <p className="mt-2 text-sm text-muted">No tenés acceso a este módulo.</p>
      </div>
    );
  }
  const readOnly = !canEdit(mp, key);

  const sb = await createClient();

  // filas del recurso
  let query = sb.from(resource.table).select("*");
  if (resource.orderBy) {
    query = query.order(resource.orderBy.column, {
      ascending: resource.orderBy.ascending ?? true,
    });
  }
  const { data: rows } = await query;

  // opciones para campos de referencia
  const refOptions: Record<string, { id: string; label: string }[]> = {};
  for (const f of resource.fields) {
    if (f.type === "reference" && f.refTable) {
      const { data } = await sb
        .from(f.refTable)
        .select(`id, ${f.refLabel ?? "id"}`)
        .limit(500);
      refOptions[f.name] = (data ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        label: String(r[f.refLabel ?? "id"] ?? r.id),
      }));
    }
  }

  return (
    <ResourceManager
      resource={resource}
      rows={(rows ?? []) as Record<string, unknown>[]}
      refOptions={refOptions}
      readOnly={readOnly}
    />
  );
}
