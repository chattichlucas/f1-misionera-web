"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { previewRecalc, applyRecalc, type RecalcResult } from "./actions";
import { formatDuration } from "@/lib/format";

type Round = { id: string; label: string; is_sprint: boolean };

export function RecalcTool({ rounds }: { rounds: Round[] }) {
  const router = useRouter();
  const [roundId, setRoundId] = useState(rounds[0]?.id ?? "");
  const [session, setSession] = useState<"race" | "sprint">("race");
  const [state, setState] = useState<RecalcResult | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = rounds.find((r) => r.id === roundId);

  async function doPreview() {
    setBusy(true);
    setState(null);
    setState(await previewRecalc(roundId, session));
    setBusy(false);
  }
  async function doApply() {
    if (!confirm("¿Aplicar las nuevas posiciones y puntos a esta fecha?")) return;
    setBusy(true);
    const res = await applyRecalc(roundId, session);
    setState(res);
    setBusy(false);
    if (res.applied) router.refresh();
  }

  const input = "rounded-lg bg-[var(--panel-2)] px-3 py-2 text-sm outline-none border";
  const st = { borderColor: "var(--line)" } as const;

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Fecha</span>
          <select
            className={input}
            style={st}
            value={roundId}
            onChange={(e) => {
              setRoundId(e.target.value);
              setState(null);
            }}
          >
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {selected?.is_sprint && (
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Sesión</span>
            <select
              className={input}
              style={st}
              value={session}
              onChange={(e) => setSession(e.target.value as "race" | "sprint")}
            >
              <option value="race">Carrera</option>
              <option value="sprint">Sprint</option>
            </select>
          </label>
        )}
        <button className="btn btn-ghost" onClick={doPreview} disabled={busy || !roundId}>
          {busy ? "Calculando…" : "Previsualizar"}
        </button>
      </div>

      {state?.error && (
        <p className="panel p-3 text-sm font-semibold text-negative">{state.error}</p>
      )}

      {state?.rows && (
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3" style={st}>
            <p className="text-sm font-bold">
              {state.applied ? "Aplicado ✓" : "Previsualización"} · {state.rows.length} pilotos
            </p>
            {!state.applied && (
              <button className="btn btn-primary !py-1.5" onClick={doApply} disabled={busy}>
                Aplicar
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="data-table min-w-[680px]">
              <thead>
                <tr>
                  <th>Piloto</th>
                  <th className="num">Tiempo</th>
                  <th className="num">Penal.</th>
                  <th className="num">Ajustado</th>
                  <th className="num">Pos</th>
                  <th className="num">Pts</th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((r) => {
                  const posChanged = r.position != null && r.position !== r.new_position;
                  const ptsChanged = r.points !== r.new_points;
                  return (
                    <tr key={r.id}>
                      <td className="font-semibold">
                        {r.driver_name}
                        {r.dsq ? " · DSQ" : r.dnf || r.finish_ms == null ? " · DNF" : ""}
                      </td>
                      <td className="num text-muted">{formatDuration(r.finish_ms)}</td>
                      <td className="num">{r.penalty_s ? `+${r.penalty_s}s` : "—"}</td>
                      <td className="num text-muted">{formatDuration(r.adjusted_ms)}</td>
                      <td className="num font-bold">
                        {posChanged && (
                          <span className="text-muted line-through">{r.position} </span>
                        )}
                        <span className={posChanged ? "text-primary" : ""}>{r.new_position}</span>
                      </td>
                      <td className="num font-extrabold">
                        {ptsChanged && (
                          <span className="text-muted line-through">{r.points} </span>
                        )}
                        <span className={ptsChanged ? "text-primary" : ""}>{r.new_points}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
