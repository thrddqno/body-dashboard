import { useEffect, useState } from "react";

import { generateWeeklyAiAnalysis, getLatestWeeklyAiAnalysis } from "@/api/aiAnalysisApi";
import { ApiError } from "@/api/httpClient";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { AiAnalysisResult } from "@/features/aiAnalysis/components/AiAnalysisResult";
import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";

export function AiAnalysisPage() {
  const [analysis, setAnalysis] = useState<WeeklyAiAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();

    async function loadLatest() {
      try {
        setAnalysis(await getLatestWeeklyAiAnalysis(controller.signal));
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        if (!(loadError instanceof ApiError && loadError.status === 404)) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load saved analysis.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingLatest(false);
        }
      }
    }

    void loadLatest();
    return () => controller.abort();
  }, []);

  async function handleGenerate() {
    setIsLoading(true);
    setError(undefined);

    try {
      setAnalysis(await generateWeeklyAiAnalysis());
    } catch (generateError) {
      if (generateError instanceof ApiError && generateError.status === 429) {
        setError(generateError.message);
      } else if (generateError instanceof ApiError && generateError.status === 503) {
        setError("The AI provider failed to respond. Retry after checking backend AI configuration.");
      } else {
        setError(generateError instanceof Error ? generateError.message : "Unable to generate weekly analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI analysis"
        title="Weekly interpretation"
        description="Generate an AI interpretation of the current week. This output is distinct from measured facts and deterministic analytics."
        actions={
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isLoading || isLoadingLatest}
            className="button-primary"
          >
            {isLoading ? "Generating..." : "Generate weekly analysis"}
          </button>
        }
      />
      {isLoading || isLoadingLatest ? <LoadingState label={isLoading ? "Generating analysis" : "Loading saved analysis"} /> : null}
      {error ? <ErrorState title="Analysis unavailable" message={error} /> : null}
      {analysis ? <AiAnalysisResult analysis={analysis} /> : null}
      {!analysis && !isLoading && !isLoadingLatest && !error ? (
        <div className="panel p-6 text-sm leading-6 text-[var(--muted)]">
          Generate analysis when you want a fresh interpretation of the current week. Successful results are saved in the database and restored here on your next visit.
        </div>
      ) : null}
    </main>
  );
}
