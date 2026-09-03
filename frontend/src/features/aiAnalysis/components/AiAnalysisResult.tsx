import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";
import ReactMarkdown from "react-markdown";

import { AnalysisSection } from "@/features/aiAnalysis/components/AnalysisSection";
import { formatDateTimeString } from "@/utils/formatters";

interface AiAnalysisResultProps {
  analysis: WeeklyAiAnalysis;
}

export function AiAnalysisResult({ analysis }: AiAnalysisResultProps) {
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <p className="eyebrow">
          AI-generated interpretation
        </p>
        <h2 className="font-serif-display mt-2 text-3xl font-medium text-[var(--ink)]">Summary</h2>
        <div className="rich-text mt-4 text-sm leading-7 text-[var(--ink)]">
          <ReactMarkdown>{analysis.summary}</ReactMarkdown>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Saved {formatDateTimeString(analysis.generatedAt)}. AI interpretation remains separate from measured facts.
        </p>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalysisSection title="Known facts" items={analysis.knownFacts} emptyDescription="No factual context was returned." tone="facts" />
        <AnalysisSection title="Interpretation" items={analysis.interpretation} emptyDescription="No AI interpretation was returned." />
        <AnalysisSection title="Strengths" items={analysis.strengths} emptyDescription="No strengths were identified." tone="positive" />
        <AnalysisSection title="Concerns" items={analysis.concerns} emptyDescription="No concerns were identified." tone="caution" />
        <AnalysisSection title="Recommendations" items={analysis.recommendations} emptyDescription="No recommendations were returned." tone="action" />
        <AnalysisSection title="Data gaps" items={analysis.dataGaps} emptyDescription="No data gaps were reported." tone="muted" />
      </div>
    </div>
  );
}
