"use client";

import { useEffect, useState } from "react";

type Labels = { d: string; h: string; m: string; s: string; live: string };

function diff(target: number) {
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
  const [t, setT] = useState(() => (Number.isNaN(target) ? null : diff(target)));

  useEffect(() => {
    if (Number.isNaN(target)) return;
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) return null;
  if (t.done) return <p className="text-sm font-bold text-primary">{labels.live}</p>;

  const box = (value: number, label: string) => (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
    >
      <div className="text-xl font-extrabold tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      {box(t.d, labels.d)}
      {box(t.h, labels.h)}
      {box(t.m, labels.m)}
      {box(t.s, labels.s)}
    </div>
  );
}
