"use client";

import { useEffect, useState } from "react";

type Labels = { d: string; h: string; m: string; s: string; live: string };
type Diff = { d: number; h: number; m: number; s: number; done: boolean };

function diff(target: number): Diff {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({
  iso,
  labels = { d: "Días", h: "Horas", m: "Min", s: "Seg", live: "¡En pista!" },
}: {
  iso: string | null;
  labels?: Labels;
}) {
  const target = iso ? new Date(iso).getTime() : NaN;
  // Empieza en null en server y cliente (mismo HTML) → sin hydration mismatch.
  const [t, setT] = useState<Diff | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const box = (value: number | null, label: string) => (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
    >
      <div className="text-xl font-extrabold tabular-nums">
        {value == null ? "--" : String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );

  if (t?.done) return <p className="text-sm font-bold text-primary">{labels.live}</p>;

  return (
    <div className="grid grid-cols-4 gap-2">
      {box(t?.d ?? null, labels.d)}
      {box(t?.h ?? null, labels.h)}
      {box(t?.m ?? null, labels.m)}
      {box(t?.s ?? null, labels.s)}
    </div>
  );
}
