import type { ReactNode } from "react";

interface ChartPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ChartPanel({ title, description, children }: ChartPanelProps) {
  return (
    <section className="panel p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      <div className="w-full">{children}</div>
    </section>
  );
}
