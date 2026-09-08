"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { classNames } from "@/lib/format";

function Flag({ code }: { code: Locale }) {
  const common = { viewBox: "0 0 24 16", className: "h-4 w-6 rounded-[2px]" };
  if (code === "es")
    return (
      <svg {...common} aria-hidden>
        <rect width="24" height="16" fill="#74acdf" />
        <rect y="5.33" width="24" height="5.34" fill="#fff" />
        <circle cx="12" cy="8" r="1.7" fill="#f6b40e" />
      </svg>
    );
  if (code === "en")
    return (
      <svg {...common} aria-hidden>
        <rect width="24" height="16" fill="#012169" />
        <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3" />
        <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
        <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <rect width="24" height="16" fill="#009c3b" />
      <path d="M12 2l9.5 6-9.5 6-9.5-6z" fill="#ffdf00" />
      <circle cx="12" cy="8" r="3" fill="#002776" />
    </svg>
  );
}

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
          aria-label={l.label}
          title={l.label}
          className={classNames(
            "rounded-md p-1 transition",
            l.code === current ? "opacity-100 ring-1 ring-[var(--primary)]" : "opacity-45 hover:opacity-90",
          )}
        >
          <Flag code={l.code} />
        </button>
      ))}
    </div>
  );
}
