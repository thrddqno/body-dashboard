interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading" }: LoadingStateProps) {
  return (
    <div className="rounded-[8px] border border-[var(--panel-border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--green)]" />
        <span>{label}...</span>
      </div>
    </div>
  );
}
