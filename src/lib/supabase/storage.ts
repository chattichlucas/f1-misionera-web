import type { SupabaseClient } from "@supabase/supabase-js";

const IMG_PDF = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"];

/** Crea el bucket si no existe (service_role). Idempotente. */
export async function ensureBucket(
  admin: SupabaseClient,
  id: "media" | "comprobantes",
): Promise<void> {
  const opts =
    id === "comprobantes"
      ? {
          public: false,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
        }
      : {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: IMG_PDF,
        };
  const { error } = await admin.storage.createBucket(id, opts);
  // "already exists" -> ok
  if (error && !/exist/i.test(error.message)) throw error;
}
