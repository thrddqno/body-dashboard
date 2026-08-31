import type { EnergyLevel } from "@/types/dailyLog";

interface DailyLogFormValues {
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
  formError?: string;
  onChange: (values: DailyLogFormValues) => void;
  onSubmit: () => Promise<void>;
}

export function DailyLogForm({
  values,
  isSubmitting,
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
    <form className="panel p-6" onSubmit={handleSubmit}>
      <h2 className="font-serif-display text-2xl font-medium text-[var(--ink)]">Daily recovery and nutrition log</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Saving replaces the full daily record for this date. Leave a field blank if it was not recorded.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Sleep (hours)</span>
          <input type="number" min="0" max="24" step="0.1" value={values.sleepHours} onChange={(event) => update("sleepHours", event.target.value)} className="form-control mt-2 w-full font-normal" placeholder="8.0" />
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Steps</span>
          <input type="number" min="0" value={values.steps} onChange={(event) => update("steps", event.target.value)} className="form-control mt-2 w-full font-normal" />
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Energy</span>
          <select value={values.energy} onChange={(event) => update("energy", event.target.value as EnergyLevel | "")} className="form-control mt-2 w-full font-normal">
            <option value="">Not recorded</option>
            <option value="VERY_LOW">Very low</option>
            <option value="LOW">Low</option>
            <option value="AVERAGE">Average</option>
            <option value="HIGH">High</option>
            <option value="VERY_HIGH">Very high</option>
          </select>
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Calories</span>
          <input type="number" min="0" value={values.estimatedCalories} onChange={(event) => update("estimatedCalories", event.target.value)} className="form-control mt-2 w-full font-normal" />
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Protein (g)</span>
          <input type="number" min="0" value={values.estimatedProteinGrams} onChange={(event) => update("estimatedProteinGrams", event.target.value)} className="form-control mt-2 w-full font-normal" />
        </label>
      </div>
      <label className="mt-4 block text-sm text-[var(--ink)]">
        <span className="font-bold">Pain or soreness notes</span>
        <textarea value={values.painNotes} onChange={(event) => update("painNotes", event.target.value)} rows={3} className="form-control mt-2 w-full font-normal" />
      </label>
      <label className="mt-4 block text-sm text-[var(--ink)]">
        <span className="font-bold">Recovery notes</span>
        <textarea value={values.recoveryNotes} onChange={(event) => update("recoveryNotes", event.target.value)} rows={4} className="form-control mt-2 w-full font-normal" />
      </label>
      {formError ? <p className="mt-4 text-sm text-[var(--rose)]">{formError}</p> : null}
      <button type="submit" disabled={isSubmitting} className="button-primary mt-6">
        {isSubmitting ? "Saving..." : "Save daily log"}
      </button>
    </form>
  );
}
