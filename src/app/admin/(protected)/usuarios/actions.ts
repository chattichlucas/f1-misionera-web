"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyPermissions, MODULES, type Level } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export type ActionResult = { ok?: boolean; error?: string };

const VALID_MODULES = new Set(MODULES.map((m) => m.key));
const VALID_LEVELS = new Set<Level>(["none", "view", "edit"]);

export async function setUserPermissions(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const mp = await getMyPermissions();
    if (!mp.superadmin) return { error: "Solo un superadmin puede cambiar permisos." };

    const userId = String(formData.get("user_id") || "");
    if (!userId) return { error: "Falta el usuario." };

    const rows: { user_id: string; module: string; level: Level }[] = [];
    for (const m of MODULES) {
      const raw = String(formData.get(`perm_${m.key}`) || "none") as Level;
      if (!VALID_MODULES.has(m.key) || !VALID_LEVELS.has(raw)) continue;
      rows.push({ user_id: userId, module: m.key, level: raw });
    }

    const sb = await createClient();
    const { error } = await sb
      .from("user_permissions")
      .upsert(rows, { onConflict: "user_id,module" });
    if (error) return { error: error.message };

    let targetEmail = userId;
    try {
      const { data } = await createAdminClient().auth.admin.getUserById(userId);
      targetEmail = data.user?.email ?? userId;
    } catch {
      /* noop */
    }
    await logAudit({
      action: "permissions",
      entity: "Usuarios y permisos",
      entityId: userId,
      summary: `Actualizó permisos de ${targetEmail}`,
      details: { permissions: Object.fromEntries(rows.map((r) => [r.module, r.level])) },
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
