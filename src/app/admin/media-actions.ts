"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureBucket } from "@/lib/supabase/storage";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export type UploadResult = { url?: string; error?: string };

/** Sube una imagen al bucket "media" con service_role (no requiere policies). */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { error: "No autorizado" };

    const file = formData.get("file") as
      | (Blob & { name?: string; type: string; size: number })
      | null;
    const folderRaw = String(formData.get("folder") || "media");
    const folder = folderRaw.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "media";

    if (!file || typeof file.arrayBuffer !== "function") return { error: "Sin archivo" };
    if (!ALLOWED.has(file.type)) return { error: "Formato no permitido" };
    if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5 MB" };

    const ext = file.type === "image/svg+xml" ? "svg" : "webp";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    let { error } = await admin.storage
      .from("media")
      .upload(path, buf, { contentType: file.type, upsert: false });
    if (error && /bucket.*not found/i.test(error.message)) {
      await ensureBucket(admin, "media");
      ({ error } = await admin.storage
        .from("media")
        .upload(path, buf, { contentType: file.type, upsert: false }));
    }
    if (error) return { error: error.message };

    const { data } = admin.storage.from("media").getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir" };
  }
}
