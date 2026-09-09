import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyPermissions, canView, canEdit } from "@/lib/permissions";
import { InscriptionRow } from "./row";
import type { Inscription } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInscripcionesPage() {
  const mp = await getMyPermissions();
  if (!canView(mp, "inscriptions")) {
    return (
      <div className="panel p-6">
        <h1 className="text-lg font-extrabold">Inscripciones</h1>
        <p className="mt-2 text-sm text-muted">No tenés acceso a este módulo.</p>
      </div>
    );
  }
  const editable = canEdit(mp, "inscriptions");

  const sb = await createClient();
  const { data } = await sb
    .from("inscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Inscription[];

  // URLs firmadas (1h) para los comprobantes del bucket privado
  const proofUrls: Record<string, string> = {};
  const withProof = rows.filter((r) => r.payment_proof_path);
  if (withProof.length > 0) {
    try {
      const admin = createAdminClient();
      await Promise.all(
        withProof.map(async (r) => {
          const { data: signed } = await admin.storage
            .from("comprobantes")
            .createSignedUrl(r.payment_proof_path as string, 3600);
          if (signed?.signedUrl) proofUrls[r.id] = signed.signedUrl;
        }),
      );
    } catch {
      /* sin service_role: no se pueden ver los comprobantes */
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Inscripciones</h1>
      <p className="text-sm text-muted">
        {rows.length} solicitudes{!editable && " · solo lectura"}
      </p>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="panel p-6 text-sm text-muted">No hay inscripciones.</p>
        )}
        {rows.map((r) => (
          <InscriptionRow key={r.id} row={r} editable={editable} proofUrl={proofUrls[r.id]} />
        ))}
      </div>
    </div>
  );
}
