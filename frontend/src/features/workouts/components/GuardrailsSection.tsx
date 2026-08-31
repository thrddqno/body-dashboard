interface GuardrailsSectionProps {
  items: string[];
}

export function GuardrailsSection({ items }: GuardrailsSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-[8px] border border-[var(--orange)]/20 bg-[var(--medium-bg)] p-5">
      <p className="text-[10px] font-black uppercase tracking-wide text-[var(--orange)]">
        Guardrails
      </p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm leading-5 text-[var(--ink)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
