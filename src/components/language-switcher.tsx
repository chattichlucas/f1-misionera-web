"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { classNames } from "@/lib/format";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(code: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1" aria-label="Idioma">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => set(l.code)}
          disabled={pending}
          className={classNames(
            "rounded-md px-1.5 py-1 text-xs font-bold transition",
            l.code === current ? "text-text" : "text-muted hover:text-text",
          )}
          style={l.code === current ? { background: "var(--panel)" } : undefined}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
