interface ErrorStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "Unable to load data",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-[8px] border border-[var(--high-line)] bg-[var(--high-bg)] p-6 text-sm text-[var(--rose)]">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 opacity-85">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
