"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setInscriptionStatus, deleteInscription } from "@/app/admin/actions";
import type { Inscription } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["pendiente", "aceptada", "reserva", "rechazada"] as const;

export function InscriptionRow({ row }: { row: Inscription }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeStatus(status: string) {
    setBusy(true);
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("status", status);
    await setInscriptionStatus({}, fd);
    setBusy(false);
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
              row.category_label,
              row.platform,
              row.nationality,
              row.number_pref ? `#${row.number_pref}` : null,
              row.discord,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {row.experience && <p className="mt-1 text-sm">Experiencia: {row.experience}</p>}
          {row.notes && <p className="mt-1 text-sm text-muted">{row.notes}</p>}
          <p className="mt-1 text-xs text-muted">{formatDateTime(row.created_at)}</p>
        </div>
        <span className="chip uppercase">{row.status}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={busy || row.status === s}
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
    </div>
  );
}
