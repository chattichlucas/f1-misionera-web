"use client";

import { useEffect, useState } from "react";
import { SocialIcon } from "@/components/social-icon";

type RaceDay = {
  dateKey: string;
  circuits: { name: string; time: string; category: string | null; flag: string }[];
  youtube: string | null;
  tiktok: string | null;
  twitch: string | null;
  title: string;
};

export function RaceDayPopup(props: RaceDay) {
  const [open, setOpen] = useState(false);
  const [enter, setEnter] = useState(false);
  const storageKey = `raceday_seen_${props.dateKey}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      /* modo privado */
    }
    const t = setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => setEnter(true));
    }, 500);
    return () => clearTimeout(t);
  }, [storageKey]);

  function close() {
    setEnter(false);
    setTimeout(() => setOpen(false), 250);
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:justify-end">
      <div
        role="dialog"
        aria-label="Día de carrera"
        className="pointer-events-auto w-full max-w-[460px] overflow-hidden rounded-3xl p-5 transition-all duration-300"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--primary) 12%, var(--panel)) 0%, var(--panel-2) 55%)",
          border: "1px solid color-mix(in srgb, var(--primary) 40%, var(--line))",
          boxShadow:
            "0 24px 70px -12px color-mix(in srgb, var(--primary) 38%, transparent), 0 8px 30px rgba(0,0,0,.4)",
          transform: enter ? "translateY(0) scale(1)" : "translateY(16px) scale(.97)",
          opacity: enter ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
            <span className="text-sm">🏁</span> {props.title}
          </p>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-[var(--panel)] hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div className="space-y-2">
            {props.circuits.map((c, i) => (
              <div key={i}>
                <p className="text-2xl font-black leading-tight tracking-tight">
                  {c.flag} {c.name}
                </p>
                <p className="text-sm text-muted">
                  {[c.category, c.time].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>

          {links.some(([, u]) => u) && (
            <div className="flex flex-wrap gap-2">
              {links
                .filter(([, u]) => Boolean(u))
                .map(([label, u]) => (
                  <a
                    key={label}
                    href={u as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition hover:brightness-110"
                    style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
                  >
                    <SocialIcon network={label} className="h-4 w-4" />
                    {label}
                  </a>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
