"use server";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureBucket } from "@/lib/supabase/storage";

export type InscriptionState = { ok?: boolean; error?: string };

const PROOF_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

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

  // --- comprobante de pago (opcional) ---
  let payment_proof_path: string | null = null;
  const file = formData.get("payment_proof");
  if (file && typeof (file as Blob).arrayBuffer === "function" && (file as Blob).size > 0) {
    const blob = file as Blob & { type: string; size: number };
    const ext = PROOF_TYPES[blob.type];
    if (!ext) return { error: "El comprobante tiene que ser imagen (JPG/PNG/WEBP) o PDF." };
    if (blob.size > 5 * 1024 * 1024) return { error: "El comprobante no puede superar 5 MB." };
    try {
      const admin = createAdminClient();
      const path = `${crypto.randomUUID()}.${ext}`;
      const buf = Buffer.from(await blob.arrayBuffer());
      let { error: upErr } = await admin.storage
        .from("comprobantes")
        .upload(path, buf, { contentType: blob.type, upsert: false });
      if (upErr && /bucket.*not found/i.test(upErr.message)) {
        await ensureBucket(admin, "comprobantes");
        ({ error: upErr } = await admin.storage
          .from("comprobantes")
          .upload(path, buf, { contentType: blob.type, upsert: false }));
      }
      if (upErr) return { error: "No se pudo subir el comprobante. Probá de nuevo." };
      payment_proof_path = path;
    } catch {
      return { error: "No se pudo procesar el comprobante." };
    }
  }

  const sb = await createClient();
  const { error } = await sb.from("inscriptions").insert({
    full_name,
    gamertag,
    category_label: category_label || null,
    nationality: String(formData.get("nationality") ?? "").trim() || null,
    number_pref: Number.isFinite(number_pref as number) ? number_pref : null,
    discord: String(formData.get("discord") ?? "").trim() || null,
    platform: String(formData.get("platform") ?? "").trim() || null,
    experience: String(formData.get("experience") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    payment_proof_path,
    status: "pendiente",
  });

  if (error) return { error: "No se pudo enviar la inscripción. Probá de nuevo." };
  return { ok: true };
}
