"use client";

import { useRef, useState } from "react";
import { uploadMedia } from "@/app/admin/media-actions";

type Props = {
  name: string;
  value?: string | null;
  folder?: string;
  /** ancho máximo al que se reescala el raster antes de subir (px) */
  maxWidth?: number;
  /** peso máximo aceptado (KB) tras compresión */
  maxKB?: number;
  hint?: string;
};

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/svg+xml";

/** Reescala/comprime a WebP en el navegador. SVG pasa sin tocar. */
async function processImage(file: File, maxWidth: number): Promise<Blob> {
  if (file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/webp", 0.85),
  );
  return blob && blob.size < file.size ? blob : file;
}

export function ImageUpload({
  name,
  value,
  folder = "media",
  maxWidth = 480,
  maxKB = 400,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const processed = await processImage(file, maxWidth);
      const kb = Math.round(processed.size / 1024);
      if (kb > maxKB) {
        setError(
          `La imagen pesa ${kb} KB (máx ${maxKB} KB). Probá con un archivo más chico o comprimila.`,
        );
        setBusy(false);
        return;
      }
      const ext = processed.type === "image/svg+xml" ? "svg" : "webp";
      const fd = new FormData();
      fd.set("file", processed, `upload.${ext}`);
      fd.set("folder", folder);
      const res = await uploadMedia(fd);
      if (res.error || !res.url) {
        setError(`No se pudo subir: ${res.error ?? "error desconocido"}`);
        setBusy(false);
        return;
      }
      setUrl(res.url);
      setNote(`Subida OK · ${kb} KB`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la imagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-12 w-12 rounded object-contain"
            style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
          />
        ) : (
          <div
            className="grid h-12 w-12 place-items-center rounded text-xs text-muted"
            style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
          >
            —
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Subiendo…" : url ? "Cambiar" : "Subir imagen"}
          </button>
          {url && (
            <button
              type="button"
              className="btn btn-ghost !py-1.5 !text-xs"
              onClick={() => setUrl("")}
            >
              Quitar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onPick}
        />
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {note && <p className="text-xs text-positive">{note}</p>}
      {error && <p className="text-xs font-semibold text-negative">{error}</p>}
      <details className="text-xs text-muted">
        <summary className="cursor-pointer">Pegar URL en su lugar</summary>
        <input
          type="url"
          defaultValue={url}
          placeholder="https://…"
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 w-full rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm outline-none border"
          style={{ borderColor: "var(--line)" }}
        />
      </details>
    </div>
  );
}
