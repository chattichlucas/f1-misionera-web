"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setInscriptionStatus, deleteInscription } from "@/app/admin/actions";
import type { Inscription, Category } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["pendiente", "aceptada", "reserva", "rechazada"] as const;
const NEEDS_CATEGORY = new Set(["aceptada", "reserva"]);

export function InscriptionRow({
  row,
  categories,
  editable = true,
  proofUrl,
}: {
  row: Inscription;
  categories: Category[];
  editable?: boolean;
  proofUrl?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cat, setCat] = useState(row.category_id ?? "");

  async function changeStatus(status: string) {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("status", status);
    if (NEEDS_CATEGORY.has(status)) fd.set("category_id", cat);
    const res = await setInscriptionStatus({}, fd);
    setBusy(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirm("¿Eliminar esta inscripción?")) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("id", row.id);
    await deleteInscription({}, fd);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold">
            {row.full_name} <span className="text-muted">· {row.gamertag}</span>
          </p>
          <p className="text-sm text-muted">
            {[
              row.platform,
              row.nationality,
              row.number_pref ? `#${row.number_pref}` : null,
              row.discord ? `Discord: ${row.discord}` : null,
              row.whatsapp ? `WhatsApp: ${row.whatsapp}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {row.experience && <p className="mt-1 text-sm">Experiencia: {row.experience}</p>}
          {row.notes && <p className="mt-1 text-sm text-muted">{row.notes}</p>}

          {row.payment_proof_path && (
            <div className="mt-2 rounded-lg p-2 text-sm" style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}>
              <p className="font-semibold">Comprobante de pago</p>
              {proofUrl ? (
                <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-primary">
                  Ver comprobante →
                </a>
              ) : (
                <span className="text-muted">Adjunto (no se pudo generar el enlace)</span>
              )}
            </div>
          )}

          <p className="mt-1 text-xs text-muted">{formatDateTime(row.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="chip uppercase">{row.status}</span>
          {row.driver_id && (
            <span className="chip text-[10px]" style={{ borderColor: "var(--positive)" }}>
              piloto creado
            </span>
          )}
        </div>
      </div>

      {editable && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-lg bg-[var(--panel-2)] px-2 py-1 text-sm outline-none border"
            style={{ borderColor: cat ? "var(--line)" : "var(--primary)" }}
          >
            <option value="">Categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={busy || row.status === s || (NEEDS_CATEGORY.has(s) && !cat)}
              onClick={() => changeStatus(s)}
              className="chip font-semibold disabled:opacity-40"
              style={row.status === s ? { borderColor: "var(--primary)" } : undefined}
            >
              {s}
            </button>
          ))}
          <button
            onClick={remove}
            disabled={busy}
            className="chip font-semibold text-muted hover:text-negative"
          >
            eliminar
          </button>
        </div>
      )}

      {error && (
        <p
          className="mt-3 rounded-lg p-3 text-sm font-semibold text-negative"
          style={{ background: "var(--panel-2)", border: "1px solid var(--negative)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
