import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";
import { formatDateTimeString } from "@/utils/formatters";

interface CoachNotesProps {
  analysis: WeeklyAiAnalysis | null;
  isLoading: boolean;
  error?: string;
}

export function CoachNotes({ analysis, isLoading, error }: CoachNotesProps) {
  return (
    <section aria-labelledby="coach-notes-title">
      <p className="eyebrow">Coach notes</p>
      <h2 id="coach-notes-title" className="section-title mt-2">Latest analysis</h2>
      <div className="mt-6 border-t border-[var(--ink)]">
        <article className="grid gap-4 border-b border-[var(--line)] py-5 sm:grid-cols-[130px_1fr]">
          <div>
            <span className="inline-flex rounded-[8px] bg-[var(--low-bg)] px-2.5 py-1 text-[10px] font-black uppercase text-[var(--green)]">
              AI summary
            </span>
          </div>
          <div>
            {isLoading ? (
              <p className="text-sm text-[var(--muted)]">Loading saved analysis...</p>
            ) : analysis ? (
              <>
                <div className="rich-text text-[13px] leading-[1.65] text-[var(--ink)]">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">Generated {formatDateTimeString(analysis.generatedAt)}</p>
              </>
            ) : (
              <p className="text-[13px] leading-[1.65] text-[var(--muted)]">{error ?? "No saved analysis is available yet."}</p>
            )}
            <Link to="/analysis" className="button-secondary mt-4">Open full analysis</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
