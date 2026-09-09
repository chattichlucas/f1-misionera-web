"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESOURCES } from "@/lib/admin/resources";
import { getMyPermissions, canEdit, canView, type Level } from "@/lib/permissions";
import { parseDuration, argLocalToISO } from "@/lib/format";
import { logAudit } from "@/lib/audit";

/** Etiqueta legible de una fila (name / title / headline / round_number…). */
function rowLabel(row: Record<string, unknown>): string {
  for (const k of ["name", "title", "headline", "heading", "league_name"]) {
    if (typeof row[k] === "string" && row[k]) return row[k] as string;
  }
  if (row["round_number"] != null) return `Ronda ${row["round_number"]}`;
  return "";
}

async function requireAdmin() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return sb;
}

/** Verifica que el usuario tenga al menos `level` en `moduleKey`. */
async function requirePerm(moduleKey: string, level: Level) {
  const sb = await requireAdmin();
  const mp = await getMyPermissions();
  const ok = level === "edit" ? canEdit(mp, moduleKey) : canView(mp, moduleKey);
  if (!ok) throw new Error(`Sin permiso de ${level} en "${moduleKey}"`);
  return sb;
}

function coerce(value: FormDataEntryValue | null, type: string) {
  const s = typeof value === "string" ? value.trim() : "";
  switch (type) {
    case "boolean":
      return value === "on" || value === "true";
    case "number":
      return s === "" ? null : Number(s);
    case "datetime":
      return s === "" ? null : argLocalToISO(s);
    case "duration":
      return s === "" ? null : parseDuration(s);
    default:
      return s === "" ? null : s;
  }
}

export type ActionResult = { ok?: boolean; error?: string };

export async function saveResource(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const resourceKey = String(formData.get("__resource"));
    const id = String(formData.get("__id") || "");
    const resource = RESOURCES[resourceKey];
    if (!resource) return { error: "Recurso desconocido" };
    const sb = await requirePerm(resourceKey, "edit");

    const row: Record<string, unknown> = {};
    for (const f of resource.fields) {
      // campos detrás de un feature flag: si no vinieron en el form, no los tocamos
      if (f.feature && !formData.has(f.name)) continue;
      if (f.type === "boolean") {
        row[f.name] = formData.get(f.name) === "on";
      } else {
        row[f.name] = coerce(formData.get(f.name), f.type);
      }
    }

    let error;
    if (id) {
      ({ error } = await sb.from(resource.table).update(row).eq("id", id));
    } else {
      ({ error } = await sb.from(resource.table).insert(row));
    }
    if (error) return { error: error.message };

    await logAudit({
      action: id ? "update" : "create",
      entity: resource.label,
      entityId: id || null,
      summary: `${id ? "Editó" : "Creó"} ${resource.label}${rowLabel(row) ? ` · ${rowLabel(row)}` : ""}`,
      details: { table: resource.table, values: row },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function deleteResource(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const resourceKey = String(formData.get("__resource"));
    const id = String(formData.get("__id") || "");
    const resource = RESOURCES[resourceKey];
    if (!resource || !id) return { error: "Datos inválidos" };
    const sb = await requirePerm(resourceKey, "edit");
    const { data: before } = await sb.from(resource.table).select("*").eq("id", id).maybeSingle();
    const { error } = await sb.from(resource.table).delete().eq("id", id);
    if (error) return { error: error.message };

    await logAudit({
      action: "delete",
      entity: resource.label,
      entityId: id,
      summary: `Borró ${resource.label}${before && rowLabel(before) ? ` · ${rowLabel(before)}` : ""}`,
      details: { table: resource.table, deleted: before ?? null },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function saveSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const sb = await requirePerm("settings", "edit");
    const keys = [
      "league_name", "tagline", "season_label", "logo_url", "hero_image_url",
      "color_bg", "color_panel", "color_panel_2", "color_line", "color_text",
      "color_muted", "color_primary", "color_primary_fg", "color_accent",
      "color_positive", "color_negative", "discord_url", "instagram_url",
      "youtube_url", "twitch_url", "tiktok_url", "contact_email",
      "maintenance_message",
      "payment_amount", "payment_alias", "payment_holder",
    ];
    const row: Record<string, unknown> = { id: 1 };
    for (const k of keys) {
      const v = formData.get(k);
      row[k] = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
    }
    // los de texto obligatorios no deben quedar null
    for (const k of ["league_name", "tagline", "season_label"]) {
      if (!row[k]) row[k] = k === "league_name" ? "Mi Liga" : "Temporada 2026";
    }
    row["inscriptions_open"] = formData.get("inscriptions_open") === "on";
    row["maintenance_mode"] = formData.get("maintenance_mode") === "on";
    row["recalc_enabled"] = formData.get("recalc_enabled") === "on";
    row["pole_fl_enabled"] = formData.get("pole_fl_enabled") === "on";
    const loc = String(formData.get("default_locale") || "es");
    row["default_locale"] = ["es", "en", "pt"].includes(loc) ? loc : "es";

    const pointsRaw = String(formData.get("points_scheme") || "").trim();
    if (pointsRaw) {
      try {
        row["points_scheme"] = JSON.parse(pointsRaw);
      } catch {
        return { error: "El esquema de puntos no es JSON válido." };
      }
    }

    const { error } = await sb.from("site_settings").upsert(row, { onConflict: "id" });
    if (error) return { error: error.message };
    await logAudit({
      action: "settings",
      entity: "Ajustes del sitio",
      summary: "Actualizó los ajustes del sitio",
      details: {
        maintenance_mode: row["maintenance_mode"],
        recalc_enabled: row["recalc_enabled"],
        pole_fl_enabled: row["pole_fl_enabled"],
        default_locale: row["default_locale"],
      },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function setInscriptionStatus(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const sb = await requirePerm("inscriptions", "edit");
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    const { data: insc } = await sb
      .from("inscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    // Al aceptar / poner en reserva: si ya hay un piloto con ese gamertag o
    // nombre en la categoría, NO se acepta — hay que resolver el conflicto.
    if (insc && (status === "aceptada" || status === "reserva") && insc.category_id) {
      const conflict = await findDriverConflict(
        insc.category_id as string,
        (insc.gamertag as string | null) ?? null,
        (insc.full_name as string | null) ?? null,
        (insc.driver_id as string | null) ?? null,
      );
      if (conflict) {
        return {
          error: `Ya existe el piloto "${conflict.name}"${conflict.gamertag ? ` (${conflict.gamertag})` : ""} en esa categoría. No se puede aceptar esta inscripción hasta resolver el conflicto: revisá si es la misma persona (borrá esta inscripción) o corregí el gamertag/nombre.`,
        };
      }
    }

    const { error } = await sb.from("inscriptions").update({ status }).eq("id", id);
    if (error) return { error: error.message };

    let driverNote = "";
    if (insc && (status === "aceptada" || status === "reserva")) {
      driverNote = await ensureDriverFromInscription(insc as Record<string, unknown>, status);
    }

    await logAudit({
      action: "inscription",
      entity: "Inscripciones",
      entityId: id,
      summary: `Cambió inscripción de ${insc?.full_name ?? "?"} a "${status}"${driverNote}`,
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

/** Devuelve un piloto ya existente en la categoría con el mismo gamertag o nombre
 *  (ignora el que ya esté vinculado a esta inscripción). */
async function findDriverConflict(
  categoryId: string,
  gamertag: string | null,
  fullName: string | null,
  ownDriverId: string | null,
): Promise<{ id: string; name: string; gamertag: string | null } | null> {
  try {
    const admin = createAdminClient();
    const g = gamertag?.trim().toLowerCase() ?? null;
    const n = fullName?.trim().toLowerCase() ?? null;
    const { data } = await admin
      .from("drivers")
      .select("id, gamertag, name")
      .eq("category_id", categoryId);
    if (!g || !n) return null; // hace falta gamertag Y nombre para considerarlo el mismo piloto
    return (
      (data ?? []).find(
        (d) =>
          d.id !== ownDriverId &&
          d.gamertag &&
          d.name &&
          d.gamertag.trim().toLowerCase() === g &&
          d.name.trim().toLowerCase() === n,
      ) ?? null
    );
  } catch {
    return null;
  }
}

/** Crea el piloto (sin escudería) a partir de una inscripción aceptada. */
async function ensureDriverFromInscription(
  insc: Record<string, unknown>,
  status: string,
): Promise<string> {
  try {
    const admin = createAdminClient();
    const inscId = String(insc.id);
    const categoryId = (insc.category_id as string) ?? null;
    if (!categoryId) return " · sin categoría, no se creó piloto";

    // ¿ya tiene piloto vinculado y existe?
    if (insc.driver_id) {
      const { data: existing } = await admin
        .from("drivers")
        .select("id")
        .eq("id", insc.driver_id as string)
        .maybeSingle();
      if (existing) {
        await admin
          .from("drivers")
          .update({ seat: status === "reserva" ? "reserva" : "titular" })
          .eq("id", existing.id);
        return " · piloto ya vinculado";
      }
    }

    const gamertag = (insc.gamertag as string | null)?.trim() ?? null;
    const fullName = (insc.full_name as string | null)?.trim() ?? null;

    const { data: created, error } = await admin
      .from("drivers")
      .insert({
        category_id: categoryId,
        team_id: null,
        name: fullName ?? "Sin nombre",
        nationality: (insc.nationality as string | null) ?? null,
        number: (insc.number_pref as number | null) ?? null,
        gamertag,
        seat: status === "reserva" ? "reserva" : "titular",
      })
      .select("id")
      .single();
    if (error || !created) return ` · no se pudo crear el piloto (${error?.message ?? "?"})`;

    await admin.from("inscriptions").update({ driver_id: created.id }).eq("id", inscId);
    return " · piloto creado (sin escudería)";
  } catch (e) {
    return ` · error creando piloto (${e instanceof Error ? e.message : "?"})`;
  }
}

export async function deleteInscription(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const sb = await requirePerm("inscriptions", "edit");
    const id = String(formData.get("id"));
    const { data: before } = await sb
      .from("inscriptions")
      .select("full_name")
      .eq("id", id)
      .maybeSingle();
    const { error } = await sb.from("inscriptions").delete().eq("id", id);
    if (error) return { error: error.message };
    await logAudit({
      action: "delete",
      entity: "Inscripciones",
      entityId: id,
      summary: `Borró inscripción de ${before?.full_name ?? "?"}`,
    });
    revalidatePath("/admin/inscripciones");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
