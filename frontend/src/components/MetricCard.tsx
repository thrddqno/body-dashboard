import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  helperText?: string;
  accent?: ReactNode;
}

export function MetricCard({
  label,
  value,
  helperText,
  accent,
}: MetricCardProps) {
  return (
    <article className="subtle-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-black uppercase text-[var(--muted)]">
          {label}
        </p>
        {accent}
      </div>
      <p className="font-serif-display mt-4 text-3xl font-medium text-[var(--ink)]">{value}</p>
      {helperText ? (
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{helperText}</p>
      ) : null}
    </article>
  );
}
