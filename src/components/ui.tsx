import type { ReactNode } from "react";
import { classNames } from "@/lib/format";

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="shell">
      <div className="panel p-6 sm:p-8">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {children && <div className="mt-2 max-w-2xl text-sm text-muted">{children}</div>}
      </div>
    </section>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={classNames("panel", className)}>{children}</div>;
}

export function PanelTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-5 py-4"
      style={{ borderColor: "var(--line)" }}
    >
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-muted">{children}</div>
  );
}

export function TeamChip({
  name,
  color,
  color2,
}: {
  name: string | null;
  color?: string | null;
  color2?: string | null;
}) {
  if (!name) return <span className="text-muted">–</span>;
  return (
    <span className="chip" style={{ borderColor: "var(--line)" }}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${color ?? "#888"}, ${color2 ?? "#333"})`,
        }}
      />
      {name}
    </span>
  );
}
