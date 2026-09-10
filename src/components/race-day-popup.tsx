"use client";

import { useEffect, useState } from "react";
import { SocialIcon } from "@/components/social-icon";

type RaceDay = {
  dateKey: string; // YYYY-MM-DD (ARG)
  circuits: { name: string; time: string; category: string | null; flag: string }[];
  youtube: string | null;
  tiktok: string | null;
  twitch: string | null;
  title: string; // "Hoy se corre en" traducido
};

export function RaceDayPopup(props: RaceDay) {
  const [open, setOpen] = useState(false);
  const storageKey = `raceday_seen_${props.dateKey}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      /* modo privado */
    }
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [storageKey]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* noop */
    }
  }

  if (!open) return null;

  const links: Array<[string, string | null]> = [
    ["YouTube", props.youtube],
    ["TikTok", props.tiktok],
    ["Twitch", props.twitch],
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:justify-end">
      <div
        className="panel w-full max-w-sm p-5 shadow-panel"
        style={{ borderColor: "var(--primary)" }}
        role="dialog"
        aria-label="Día de carrera"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow">🏁 {props.title}</p>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {props.circuits.map((c, i) => (
            <div key={i}>
              <p className="text-xl font-extrabold">
                {c.flag} {c.name}
              </p>
              <p className="text-sm text-muted">
                {[c.category, c.time].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>

        {links.some(([, u]) => u) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {links
              .filter(([, u]) => Boolean(u))
              .map(([label, u]) => (
                <a
                  key={label}
                  href={u as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary !py-2 !text-xs"
                >
                  <SocialIcon network={label} className="h-4 w-4" />
                  Ver en {label}
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
