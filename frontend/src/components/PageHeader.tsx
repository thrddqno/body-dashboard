interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showDivider?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  showDivider = true,
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between ${showDivider ? "border-b border-[var(--line)]" : ""}`}>
      <div>
        {eyebrow ? (
          <p className="eyebrow">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif-display mt-2 text-4xl font-medium leading-none text-[var(--ink)] sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}
