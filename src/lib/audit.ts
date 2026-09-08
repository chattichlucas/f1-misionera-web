import { createAdminClient } from "@/lib/supabase/admin";
import { getMyPermissions } from "@/lib/permissions";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "settings"
  | "permissions"
  | "inscription"
  | "recalc"
  | "import";

/** Registra una acción del panel. Nunca lanza. */
export async function logAudit(input: {
  action: AuditAction;
  entity?: string;
  entityId?: string | null;
  summary?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const mp = await getMyPermissions();
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      actor_email: mp.email,
      actor_id: mp.userId,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      summary: input.summary ?? null,
      details: input.details ?? {},
    });
  } catch {
    /* la auditoría no debe romper la operación */
  }
}
