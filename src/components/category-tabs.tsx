import Link from "next/link";
import type { Category } from "@/lib/types";
import { classNames } from "@/lib/format";

export function CategoryTabs({
  categories,
  active,
  basePath,
  param = "cat",
  extraTabs = [],
}: {
  categories: Category[];
  active: string | null;
  basePath: string;
  param?: string;
  extraTabs?: { key: string; label: string }[];
}) {
  if (categories.length === 0 && extraTabs.length === 0) return null;

  const tab = (key: string | null, label: string) => {
    const href = key ? `${basePath}?${param}=${key}` : basePath;
    const isActive = (active ?? null) === key;
    return (
      <Link
        key={key ?? "all"}
        href={href}
        className={classNames(
          "chip font-bold transition",
          isActive ? "text-text" : "text-muted",
        )}
        style={isActive ? { borderColor: "var(--primary)", background: "var(--panel)" } : undefined}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="shell flex flex-wrap gap-2">
      {tab(null, "Todas")}
      {categories.map((c) => tab(c.slug, c.name))}
      {extraTabs.map((e) => tab(e.key, e.label))}
    </div>
  );
}
