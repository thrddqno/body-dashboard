import { EmptyState } from "@/components/EmptyState";
import ReactMarkdown from "react-markdown";

interface AnalysisSectionProps {
  title: string;
  items: string[];
  emptyDescription: string;
  tone?: "default" | "facts" | "positive" | "caution" | "action" | "muted";
}

export function AnalysisSection({
  title,
  items,
  emptyDescription,
  tone = "default",
}: AnalysisSectionProps) {
  const toneClasses = {
    default: "border-t-[var(--ink)]",
    facts: "border-t-[var(--ink)]",
    positive: "border-t-[var(--green)]",
    caution: "border-t-[var(--rose)]",
    action: "border-t-[var(--orange)]",
    muted: "border-t-[#9aa3af]",
  };

  return (
    <section className={`subtle-panel border-t-4 p-5 ${toneClasses[tone]}`}>
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">{title}</h2>
      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No entries" description={emptyDescription} />
        </div>
      ) : (
        <ul className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {items.map((item) => (
            <li key={item} className="grid grid-cols-[8px_1fr] gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
              <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 rounded-full ${tone === "positive" ? "bg-[var(--green)]" : tone === "caution" ? "bg-[var(--rose)]" : tone === "action" ? "bg-[var(--orange)]" : "bg-[var(--ink)]"}`} />
              <div className="rich-text min-w-0"><ReactMarkdown>{item}</ReactMarkdown></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
