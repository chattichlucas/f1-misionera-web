"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { classNames } from "@/lib/format";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/calendario", label: "Calendario" },
  { href: "/posiciones", label: "Posiciones" },
  { href: "/pilotos", label: "Pilotos" },
  { href: "/escuderias", label: "Escuderías" },
  { href: "/resultados", label: "Resultados" },
  { href: "/penalizaciones", label: "Penalizaciones" },
  { href: "/reglamento", label: "Reglamento" },
  { href: "/inscripciones", label: "Inscripciones" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 88%, transparent)", backdropFilter: "blur(8px)" }}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-extrabold">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={settings.league_name} className="h-9 w-auto" />
          ) : (
            <span
              className="grid h-9 w-9 place-items-center rounded-lg text-sm"
              style={{ background: "var(--primary)", color: "var(--primary-fg)" }}
            >
              {settings.league_name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="hidden text-sm uppercase tracking-wide sm:block">
            {settings.league_name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                isActive(item.href) ? "text-text" : "text-muted hover:text-text",
              )}
              style={isActive(item.href) ? { background: "var(--panel)" } : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-ghost !px-3 !py-2 lg:hidden"
          aria-label="Menú"
          aria-expanded={open}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open && (
        <nav className="border-t lg:hidden" style={{ borderColor: "var(--line)" }}>
          <div className="shell grid grid-cols-2 gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={classNames(
                  "rounded-lg px-3 py-2.5 text-sm font-semibold",
                  isActive(item.href) ? "text-text" : "text-muted",
                )}
                style={isActive(item.href) ? { background: "var(--panel)" } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
