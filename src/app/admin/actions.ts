"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
    const { data: before } = await sb
      .from("inscriptions")
      .select("full_name")
      .eq("id", id)
      .maybeSingle();
    const { error } = await sb.from("inscriptions").update({ status }).eq("id", id);
    if (error) return { error: error.message };
    await logAudit({
      action: "inscription",
      entity: "Inscripciones",
      entityId: id,
      summary: `Cambió inscripción de ${before?.full_name ?? "?"} a "${status}"`,
    });
    revalidatePath("/admin/inscripciones");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
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
