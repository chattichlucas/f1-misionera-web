"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const field =
  "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2.5 text-sm outline-none border";
const stBorder = { borderColor: "var(--line)" } as const;

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (password.length < 8) {
      setErr("La contraseña necesita al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setOk(true);
    setPassword("");
    setPassword2("");
  }

  return (
    <form onSubmit={onSubmit} className="panel max-w-sm space-y-3 p-5">
      <h2 className="font-bold">Cambiar contraseña</h2>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Nueva contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
          style={stBorder}
          autoComplete="new-password"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Repetir</span>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className={field}
          style={stBorder}
          autoComplete="new-password"
        />
      </label>
      {err && <p className="text-sm font-semibold text-negative">{err}</p>}
      {ok && <p className="text-sm font-semibold text-positive">Contraseña actualizada.</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Guardando…" : "Guardar"}
      </button>
      <p className="text-xs text-muted">
        Cambia la contraseña directamente en Supabase Auth. No manda ningún email.
      </p>
    </form>
  );
}
