"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setUserPermissions, type ActionResult } from "./actions";
import type { Level } from "@/lib/permissions";

const LEVELS: { value: Level; label: string }[] = [
  { value: "none", label: "Sin acceso" },
  { value: "view", label: "Ver" },
  { value: "edit", label: "Editar" },
];

export function UserPermissions({
  userId,
  modules,
  current,
}: {
  userId: string;
  modules: { key: string; label: string }[];
  current: Record<string, Level>;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    setUserPermissions,
    {},
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="user_id" value={userId} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <label
            key={m.key}
            className="rounded-lg border p-2 text-sm"
            style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}
          >
            <span className="mb-1 block font-semibold">{m.label}</span>
            <select
              name={`perm_${m.key}`}
              defaultValue={current[m.key] ?? "none"}
              className="w-full rounded-md bg-[var(--panel)] px-2 py-1.5 text-sm outline-none border"
              style={{ borderColor: "var(--line)" }}
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Guardar permisos"}
        </button>
        {state.ok && <span className="text-sm font-semibold text-positive">Guardado.</span>}
        {state.error && (
          <span className="text-sm font-semibold text-negative">{state.error}</span>
        )}
      </div>
    </form>
  );
}
