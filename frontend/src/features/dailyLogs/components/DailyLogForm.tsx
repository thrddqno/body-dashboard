import { FieldError } from "@/components/FieldError";
import type { EnergyLevel } from "@/types/dailyLog";

export interface DailyLogFormValues {
  sleepHours: string;
  steps: string;
  energy: EnergyLevel | "";
  painNotes: string;
  recoveryNotes: string;
  estimatedCalories: string;
  estimatedProteinGrams: string;
}

interface DailyLogFormProps {
  values: DailyLogFormValues;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  formError?: string;
  onChange: (values: DailyLogFormValues) => void;
  onSubmit: () => Promise<void>;
}

export function DailyLogForm({
  values,
  isSubmitting,
  fieldErrors,
  formError,
  onChange,
  onSubmit,
}: DailyLogFormProps) {
  const update = <K extends keyof DailyLogFormValues>(field: K, value: DailyLogFormValues[K]) => {
    onChange({ ...values, [field]: value });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  return (
    <form className="panel p-6" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Daily recovery and nutrition log</h2>
      <p className="form-help mt-2">
        Saving replaces the full daily record for this date. Leave a field blank if it was not recorded.
      </p>
      <fieldset disabled={isSubmitting}>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="daily-log-sleep" className="form-label">
              <span className="form-label-text">Sleep (hours)</span>
              <input id="daily-log-sleep" type="number" min="0" max="24" step="0.1" value={values.sleepHours} onChange={(event) => update("sleepHours", event.target.value)} className="form-control mt-2 font-normal" placeholder="8.0" aria-invalid={Boolean(fieldErrors.sleepMinutes)} aria-describedby={fieldErrors.sleepMinutes ? "daily-log-sleep-error" : undefined} />
            </label>
            <FieldError id="daily-log-sleep-error" message={fieldErrors.sleepMinutes} />
          </div>
          <div>
            <label htmlFor="daily-log-steps" className="form-label">
              <span className="form-label-text">Steps</span>
              <input id="daily-log-steps" type="number" min="0" value={values.steps} onChange={(event) => update("steps", event.target.value)} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.steps)} aria-describedby={fieldErrors.steps ? "daily-log-steps-error" : undefined} />
            </label>
            <FieldError id="daily-log-steps-error" message={fieldErrors.steps} />
          </div>
          <div>
            <label htmlFor="daily-log-energy" className="form-label">
              <span className="form-label-text">Energy</span>
              <select id="daily-log-energy" value={values.energy} onChange={(event) => update("energy", event.target.value as EnergyLevel | "")} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.energy)} aria-describedby={fieldErrors.energy ? "daily-log-energy-error" : undefined}>
                <option value="">Not recorded</option>
                <option value="VERY_LOW">Very low</option>
                <option value="LOW">Low</option>
                <option value="AVERAGE">Average</option>
                <option value="HIGH">High</option>
                <option value="VERY_HIGH">Very high</option>
              </select>
            </label>
            <FieldError id="daily-log-energy-error" message={fieldErrors.energy} />
          </div>
          <div>
            <label htmlFor="daily-log-calories" className="form-label">
              <span className="form-label-text">Calories</span>
              <input id="daily-log-calories" type="number" min="0" value={values.estimatedCalories} onChange={(event) => update("estimatedCalories", event.target.value)} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.estimatedCalories)} aria-describedby={fieldErrors.estimatedCalories ? "daily-log-calories-error" : undefined} />
            </label>
            <FieldError id="daily-log-calories-error" message={fieldErrors.estimatedCalories} />
          </div>
          <div>
            <label htmlFor="daily-log-protein" className="form-label">
              <span className="form-label-text">Protein (g)</span>
              <input id="daily-log-protein" type="number" min="0" value={values.estimatedProteinGrams} onChange={(event) => update("estimatedProteinGrams", event.target.value)} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.estimatedProteinGrams)} aria-describedby={fieldErrors.estimatedProteinGrams ? "daily-log-protein-error" : undefined} />
            </label>
            <FieldError id="daily-log-protein-error" message={fieldErrors.estimatedProteinGrams} />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="daily-log-pain-notes" className="form-label">
            <span className="form-label-text">Pain or soreness notes</span>
            <textarea id="daily-log-pain-notes" value={values.painNotes} onChange={(event) => update("painNotes", event.target.value)} rows={3} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.painNotes)} aria-describedby={fieldErrors.painNotes ? "daily-log-pain-notes-error" : undefined} />
          </label>
          <FieldError id="daily-log-pain-notes-error" message={fieldErrors.painNotes} />
        </div>
        <div className="mt-4">
          <label htmlFor="daily-log-recovery-notes" className="form-label">
            <span className="form-label-text">Recovery notes</span>
            <textarea id="daily-log-recovery-notes" value={values.recoveryNotes} onChange={(event) => update("recoveryNotes", event.target.value)} rows={4} className="form-control mt-2 font-normal" aria-invalid={Boolean(fieldErrors.recoveryNotes)} aria-describedby={fieldErrors.recoveryNotes ? "daily-log-recovery-notes-error" : undefined} />
          </label>
          <FieldError id="daily-log-recovery-notes-error" message={fieldErrors.recoveryNotes} />
        </div>
      </fieldset>
      {formError ? <p role="alert" className="form-error mt-4">{formError}</p> : null}
      <button type="submit" disabled={isSubmitting} className="button-primary mt-6">
        {isSubmitting ? "Saving..." : "Save daily log"}
      </button>
    </form>
  );
}
