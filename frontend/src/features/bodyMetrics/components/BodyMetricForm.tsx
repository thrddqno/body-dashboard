import { useState } from "react";

import { FieldError } from "@/components/FieldError";
import type { BodyMetricRequest } from "@/types/bodyMetric";
import { parseOptionalDecimal, parseRequiredDecimal } from "@/utils/forms";

interface BodyMetricFormValues {
  date: string;
  weightKg: string;
  waistCm: string;
  bodyFatPercentage: string;
}

interface BodyMetricFormProps {
  initialDate: string;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  formError?: string;
  onSubmit: (request: BodyMetricRequest) => Promise<boolean>;
}

export function BodyMetricForm({
  initialDate,
  isSubmitting,
  fieldErrors,
  formError,
  onSubmit,
}: BodyMetricFormProps) {
  const [values, setValues] = useState<BodyMetricFormValues>({
    date: initialDate,
    weightKg: "",
    waistCm: "",
    bodyFatPercentage: "",
  });

  const update = <K extends keyof BodyMetricFormValues>(field: K, value: BodyMetricFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const saved = await onSubmit({
      date: values.date,
      weightKg: parseRequiredDecimal(values.weightKg),
      waistCm: parseOptionalDecimal(values.waistCm),
      bodyFatPercentage: parseOptionalDecimal(values.bodyFatPercentage),
    });

    if (saved) {
      setValues((current) => ({
        ...current,
        weightKg: "",
        waistCm: "",
        bodyFatPercentage: "",
      }));
    }
  }

  return (
    <form className="panel p-6" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Add measurement</h2>
      <p className="form-help mt-2">
        Record factual measurements only. Existing records cannot currently be edited.
      </p>
      <fieldset disabled={isSubmitting} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="body-metric-date" className="form-label">
            <span className="form-label-text">Date</span>
            <input
              id="body-metric-date"
              type="date"
              value={values.date}
              onChange={(event) => update("date", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors.date)}
              aria-describedby={fieldErrors.date ? "body-metric-date-error" : undefined}
              required
            />
          </label>
          <FieldError id="body-metric-date-error" message={fieldErrors.date} />
        </div>
        <div>
          <label htmlFor="body-metric-weight" className="form-label">
            <span className="form-label-text">Weight (kg)</span>
            <input
              id="body-metric-weight"
              type="number"
              step="0.01"
              min="0.01"
              value={values.weightKg}
              onChange={(event) => update("weightKg", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors.weightKg)}
              aria-describedby={fieldErrors.weightKg ? "body-metric-weight-error" : undefined}
              required
            />
          </label>
          <FieldError id="body-metric-weight-error" message={fieldErrors.weightKg} />
        </div>
        <div>
          <label htmlFor="body-metric-waist" className="form-label">
            <span className="form-label-text">Waist (cm)</span>
            <input
              id="body-metric-waist"
              type="number"
              step="0.01"
              min="0.01"
              value={values.waistCm}
              onChange={(event) => update("waistCm", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors.waistCm)}
              aria-describedby={fieldErrors.waistCm ? "body-metric-waist-error" : undefined}
            />
          </label>
          <FieldError id="body-metric-waist-error" message={fieldErrors.waistCm} />
        </div>
        <div>
          <label htmlFor="body-metric-body-fat" className="form-label">
            <span className="form-label-text">Body fat (%)</span>
            <input
              id="body-metric-body-fat"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              value={values.bodyFatPercentage}
              onChange={(event) => update("bodyFatPercentage", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors.bodyFatPercentage)}
              aria-describedby={fieldErrors.bodyFatPercentage ? "body-metric-body-fat-error" : undefined}
            />
          </label>
          <FieldError id="body-metric-body-fat-error" message={fieldErrors.bodyFatPercentage} />
        </div>
      </fieldset>
      {formError ? <p role="alert" className="form-error mt-4">{formError}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary mt-6"
      >
        {isSubmitting ? "Saving..." : "Save measurement"}
      </button>
    </form>
  );
}
