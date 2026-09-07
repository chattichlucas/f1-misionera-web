"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "loading" | "request" | "set" | "done";

const field =
  "w-full rounded-lg bg-[var(--panel-2)] px-3 py-2.5 text-sm outline-none border";
const stBorder = { borderColor: "var(--line)" } as const;

export default function ClavePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Al cargar: si el link de mail trae tokens en el hash, abrimos sesión temporal.
  useEffect(() => {
    const supabase = createClient();
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const errorDesc = hash.get("error_description");
    if (errorDesc) {
      setErr(decodeURIComponent(errorDesc).replace(/\+/g, " "));
      setMode("request");
      return;
    }

    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          window.history.replaceState(null, "", window.location.pathname);
          if (error) {
            setErr("El enlace no es válido o expiró. Pedí uno nuevo.");
            setMode("request");
          } else {
            setMode("set");
          }
        });
      return;
    }

    // ¿ya hay sesión (ej. entró y quiere cambiarla)?
    supabase.auth.getSession().then(({ data }) => {
      setMode(data.session ? "set" : "request");
    });
  }, []);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/password`,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMsg("Si el email existe, te llega un enlace para definir la contraseña.");
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErr("La contraseña necesita al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setMode("done");
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center">
      <div className="panel w-full max-w-sm space-y-4 p-6">
        <div>
          <p className="eyebrow">Panel</p>
          <h1 className="text-xl font-extrabold">
            {mode === "set" ? "Definí tu contraseña" : "Recuperar acceso"}
          </h1>
        </div>

        {mode === "loading" && <p className="text-sm text-muted">Cargando…</p>}

        {mode === "request" && (
          <form onSubmit={requestLink} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                style={stBorder}
              />
            </label>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? "Enviando…" : "Enviarme el enlace"}
            </button>
          </form>
        )}

        {mode === "set" && (
          <form onSubmit={setNewPassword} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold">Nueva contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                style={stBorder}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold">Repetir contraseña</span>
              <input
                type="password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={field}
                style={stBorder}
              />
            </label>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? "Guardando…" : "Guardar y entrar"}
            </button>
          </form>
        )}

        {mode === "done" && (
          <p className="text-sm font-semibold text-positive">
            Listo. Entrando al panel…
          </p>
        )}

        {msg && <p className="text-sm text-muted">{msg}</p>}
        {err && <p className="text-sm font-semibold text-negative">{err}</p>}

        <Link href="/admin/login" className="block text-xs text-muted hover:text-text">
          ← Volver al login
        </Link>
      </div>
    </div>
  );
}
