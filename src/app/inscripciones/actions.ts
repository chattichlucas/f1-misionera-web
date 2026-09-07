"use server";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type InscriptionState = { ok?: boolean; error?: string };

export async function submitInscription(
  _prev: InscriptionState,
  formData: FormData,
): Promise<InscriptionState> {
  if (!hasSupabaseEnv()) {
    return { error: "El sitio todavía no está conectado a la base de datos." };
  }

  const full_name = String(formData.get("full_name") ?? "").trim();
  const gamertag = String(formData.get("gamertag") ?? "").trim();
  const category_label = String(formData.get("category_label") ?? "").trim();

  if (!full_name || !gamertag) {
    return { error: "Nombre y gamertag son obligatorios." };
  }

  const numberRaw = String(formData.get("number_pref") ?? "").trim();
  const number_pref = numberRaw ? Number(numberRaw) : null;

  const sb = await createClient();
  const { error } = await sb.from("inscriptions").insert({
    full_name,
    gamertag,
    category_id: (formData.get("category_id") as string) || null,
    category_label: category_label || null,
    nationality: String(formData.get("nationality") ?? "").trim() || null,
    number_pref: Number.isFinite(number_pref as number) ? number_pref : null,
    discord: String(formData.get("discord") ?? "").trim() || null,
    platform: String(formData.get("platform") ?? "").trim() || null,
    experience: String(formData.get("experience") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "pendiente",
  });

  if (error) return { error: "No se pudo enviar la inscripción. Probá de nuevo." };
  return { ok: true };
}
