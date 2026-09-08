"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { RESOURCES } from "@/lib/admin/resources";
import { getMyPermissions, canEdit, canView, type Level } from "@/lib/permissions";
import { parseDuration } from "@/lib/format";

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
      return s === "" ? null : new Date(s).toISOString();
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
    const { error } = await sb.from(resource.table).delete().eq("id", id);
    if (error) return { error: error.message };
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
    const { error } = await sb.from("inscriptions").update({ status }).eq("id", id);
    if (error) return { error: error.message };
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
    const { error } = await sb.from("inscriptions").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/inscripciones");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
