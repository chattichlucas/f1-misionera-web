"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const map: Record<string, string> = {
          "Invalid login credentials": "Email o contraseña incorrectos.",
          "Email not confirmed":
            "El usuario no está confirmado. En Supabase → Authentication → Users marcá 'Confirm email' (o recrealo con 'Auto Confirm').",
        };
        setError(map[error.message] ?? `${error.message} (código ${error.status ?? "?"})`);
        setLoading(false);
        return;
      }
      router.push(params.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar. ¿Están configuradas las variables de entorno?");
      setLoading(false);
    }
  }

  const field = "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2.5 text-sm outline-none border";

  return (
    <form onSubmit={onSubmit} className="panel w-full max-w-sm space-y-4 p-6">
      <div>
        <p className="eyebrow">Panel</p>
        <h1 className="text-xl font-extrabold">Ingresar</h1>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={field}
          style={{ borderColor: "var(--line)" }}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={field}
          style={{ borderColor: "var(--line)" }}
        />
      </label>
      {error && <p className="text-sm font-semibold text-negative">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
      <a href="/admin/password" className="block text-xs text-muted hover:text-text">
        ¿Olvidaste tu contraseña?
      </a>
      <p className="text-xs text-muted">
        Las cuentas de administrador se crean desde el panel de Supabase
        (Authentication → Users).
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="shell flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={<div className="panel w-full max-w-sm p-6 text-sm text-muted">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
