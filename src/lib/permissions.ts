import { cache } from "react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type Level = "none" | "view" | "edit";

/** Módulos gestionables. `key` coincide con la tabla (o 'settings'/'inscriptions'). */
export const MODULES: { key: string; label: string }[] = [
  { key: "seasons", label: "Temporadas" },
  { key: "categories", label: "Categorías" },
  { key: "teams", label: "Escuderías" },
  { key: "circuits", label: "Circuitos" },
  { key: "drivers", label: "Pilotos" },
  { key: "rounds", label: "Fechas / Calendario" },
  { key: "session_results", label: "Resultados" },
  { key: "penalties", label: "Penalizaciones" },
  { key: "news", label: "Noticias" },
  { key: "regulation_sections", label: "Reglamento" },
  { key: "sponsors", label: "Sponsors" },
  { key: "organizers", label: "Contacto" },
  { key: "inscriptions", label: "Inscripciones" },
  { key: "settings", label: "Ajustes del sitio" },
];

export const SUPERADMIN_EMAILS = (process.env.SUPERADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export type MyPerms = {
  userId: string | null;
  email: string | null;
  superadmin: boolean;
  /** modo compatibilidad: sin superadmins configurados => acceso total */
  compat: boolean;
  perms: Record<string, Level>;
};

export const getMyPermissions = cache(async (): Promise<MyPerms> => {
  const empty: MyPerms = {
    userId: null,
    email: null,
    superadmin: false,
    compat: SUPERADMIN_EMAILS.length === 0,
    perms: {},
  };
  if (!hasSupabaseEnv()) return empty;

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return empty;

  const email = user.email?.toLowerCase() ?? null;
  const superadmin = email ? SUPERADMIN_EMAILS.includes(email) : false;

  const { data: rows } = await sb
    .from("user_permissions")
    .select("module, level")
    .eq("user_id", user.id);

  const perms: Record<string, Level> = {};
  for (const r of rows ?? []) perms[(r as { module: string }).module] = (r as { level: Level }).level;

  return {
    userId: user.id,
    email,
    superadmin,
    compat: SUPERADMIN_EMAILS.length === 0,
    perms,
  };
});

export function levelFor(mp: MyPerms, moduleKey: string): Level {
  if (mp.superadmin || mp.compat) return "edit";
  return mp.perms[moduleKey] ?? "none";
}

export const canView = (mp: MyPerms, m: string) => levelFor(mp, m) !== "none";
export const canEdit = (mp: MyPerms, m: string) => levelFor(mp, m) === "edit";

/** ¿Puede ver al menos un módulo? (para permitir la entrada a /admin) */
export function canSeeAnything(mp: MyPerms): boolean {
  if (mp.superadmin || mp.compat) return true;
  return MODULES.some((m) => canView(mp, m.key));
}
