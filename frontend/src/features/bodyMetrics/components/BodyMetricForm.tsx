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
    <form className="panel p-6" onSubmit={handleSubmit}>
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Add measurement</h2>
      <p className="mt-2 text-sm text-slate-400">
        Record factual measurements only. Existing records cannot currently be edited.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-300">
          <span>Date</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) => setValues({ ...values, date: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white"
            required
          />
          <FieldError message={fieldErrors.date} />
        </label>
        <label className="text-sm text-slate-300">
          <span>Weight (kg)</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={values.weightKg}
            onChange={(event) => setValues({ ...values, weightKg: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white"
            required
          />
          <FieldError message={fieldErrors.weightKg} />
        </label>
        <label className="text-sm text-slate-300">
          <span>Waist (cm)</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={values.waistCm}
            onChange={(event) => setValues({ ...values, waistCm: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white"
          />
          <FieldError message={fieldErrors.waistCm} />
        </label>
        <label className="text-sm text-slate-300">
          <span>Body fat (%)</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            value={values.bodyFatPercentage}
            onChange={(event) => setValues({ ...values, bodyFatPercentage: event.target.value })}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-white"
          />
          <FieldError message={fieldErrors.bodyFatPercentage} />
        </label>
      </div>
      {formError ? <p className="mt-4 text-sm text-rose-300">{formError}</p> : null}
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
