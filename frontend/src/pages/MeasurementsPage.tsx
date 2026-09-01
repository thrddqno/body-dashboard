import { useEffect, useState } from "react";

import { createBodyMetric, listBodyMetrics } from "@/api/bodyMetricsApi";
import { ApiError } from "@/api/httpClient";
import { ChartPanel } from "@/components/ChartPanel";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { BodyMetricChart } from "@/features/bodyMetrics/components/BodyMetricChart";
import { BodyMetricForm } from "@/features/bodyMetrics/components/BodyMetricForm";
import { BodyMetricHistory } from "@/features/bodyMetrics/components/BodyMetricHistory";
import type { BodyMetric, BodyMetricRequest } from "@/types/bodyMetric";
import { formatDateInputValue } from "@/utils/dates";
import { formatMetricValue } from "@/utils/formatters";

export function MeasurementsPage() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadInitialMetrics() {
      try {
        setMetrics(await listBodyMetrics());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load measurements.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialMetrics();
  }, []);

  async function handleCreateMetric(request: BodyMetricRequest): Promise<boolean> {
    setIsSubmitting(true);
    setFormError(undefined);
    setFieldErrors({});

    try {
      const createdMetric = await createBodyMetric(request);
      setMetrics((current) =>
        [createdMetric, ...current].sort((left, right) => right.date.localeCompare(left.date)),
      );
      return true;
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setFormError(submitError.message);
        setFieldErrors(submitError.fieldErrors);
        return false;
      }

      setFormError(submitError instanceof Error ? submitError.message : "Unable to save measurement.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const latestMetric = metrics[0] ?? null;

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Measurements"
        title="Body metrics"
        description="Track body weight and optional waist or body-fat measurements. Missing values remain unreported rather than inferred."
      />
      {isLoading ? <LoadingState label="Loading measurements" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <BodyMetricForm
              initialDate={formatDateInputValue(new Date())}
              isSubmitting={isSubmitting}
              fieldErrors={fieldErrors}
              formError={formError}
              onSubmit={handleCreateMetric}
            />
            <section className="panel p-6">
              <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Latest measurement</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="subtle-panel p-5">
                  <p className="eyebrow">Weight</p>
                  <p className="font-serif-display mt-3 text-2xl text-[var(--ink)]">
                    {formatMetricValue(latestMetric?.weightKg ?? null, "kg")}
                  </p>
                </div>
                <div className="subtle-panel p-5">
                  <p className="eyebrow">Waist</p>
                  <p className="font-serif-display mt-3 text-2xl text-[var(--ink)]">
                    {formatMetricValue(latestMetric?.waistCm ?? null, "cm")}
                  </p>
                </div>
                <div className="subtle-panel p-5">
                  <p className="eyebrow">Body fat</p>
                  <p className="font-serif-display mt-3 text-2xl text-[var(--ink)]">
                    {formatMetricValue(latestMetric?.bodyFatPercentage ?? null, "%")}
                  </p>
                </div>
              </div>
            </section>
          </div>
          <ChartPanel title="Measurement trends" description="Charts show only recorded values on their real dates.">
            <BodyMetricChart metrics={metrics} />
          </ChartPanel>
          <BodyMetricHistory metrics={metrics} />
        </>
      ) : null}
    </main>
  );
}
