interface WarmupSectionProps {
  items: string[];
}

export function WarmupSection({ items }: WarmupSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-5">
      <p className="eyebrow">Warm-up</p>
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
