import { FieldError } from "@/components/FieldError";

interface SetEditorProps {
  exerciseIndex: number;
  setIndex: number;
  value: {
    weightKg: string;
    reps: string;
    rir: string;
    warmup: boolean;
  };
  onChange: (field: "weightKg" | "reps" | "rir" | "warmup", value: string | boolean) => void;
  onRemove: () => void;
  fieldErrors: Record<string, string>;
}

export function SetEditor({
  exerciseIndex,
  setIndex,
  value,
  onChange,
  onRemove,
  fieldErrors,
}: SetEditorProps) {
  const base = `exercises[${exerciseIndex}].sets[${setIndex}]`;
  const idBase = `workout-exercise-${exerciseIndex}-set-${setIndex}`;

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-white p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idBase}-weight`} className="form-label">
            <span className="form-label-text">Weight (kg)</span>
            <input
              id={`${idBase}-weight`}
              type="number"
              step="0.01"
              min="0"
              value={value.weightKg}
              onChange={(event) => onChange("weightKg", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors[`${base}.weightKg`])}
              aria-describedby={fieldErrors[`${base}.weightKg`] ? `${idBase}-weight-error` : undefined}
              required
            />
          </label>
          <FieldError id={`${idBase}-weight-error`} message={fieldErrors[`${base}.weightKg`]} />
        </div>
        <div>
          <label htmlFor={`${idBase}-reps`} className="form-label">
            <span className="form-label-text">Reps</span>
            <input
              id={`${idBase}-reps`}
              type="number"
              min="1"
              value={value.reps}
              onChange={(event) => onChange("reps", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors[`${base}.reps`])}
              aria-describedby={fieldErrors[`${base}.reps`] ? `${idBase}-reps-error` : undefined}
              required
            />
          </label>
          <FieldError id={`${idBase}-reps-error`} message={fieldErrors[`${base}.reps`]} />
        </div>
        <div>
          <label htmlFor={`${idBase}-rir`} className="form-label">
            <span className="form-label-text">RIR</span>
            <input
              id={`${idBase}-rir`}
              type="number"
              min="0"
              max="10"
              value={value.rir}
              onChange={(event) => onChange("rir", event.target.value)}
              className="form-control mt-2 font-normal"
              aria-invalid={Boolean(fieldErrors[`${base}.rir`])}
              aria-describedby={fieldErrors[`${base}.rir`] ? `${idBase}-rir-error` : undefined}
            />
          </label>
          <FieldError id={`${idBase}-rir-error`} message={fieldErrors[`${base}.rir`]} />
        </div>
        <div className="flex items-center md:items-end">
          <label htmlFor={`${idBase}-warmup`} className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              id={`${idBase}-warmup`}
              type="checkbox"
              checked={value.warmup}
              onChange={(event) => onChange("warmup", event.target.checked)}
              className="form-checkbox"
              aria-invalid={Boolean(fieldErrors[`${base}.warmup`])}
              aria-describedby={fieldErrors[`${base}.warmup`] ? `${idBase}-warmup-error` : undefined}
            />
            <span className="font-bold">Warm-up</span>
          </label>
          <FieldError id={`${idBase}-warmup-error`} message={fieldErrors[`${base}.warmup`]} />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove set ${setIndex + 1}`}
          title={`Remove set ${setIndex + 1}`}
          className="inline-grid h-10 w-10 place-items-center self-end justify-self-end rounded-[8px] border border-[#e3b9ae] text-xl font-bold leading-none text-[var(--rose)] transition hover:bg-[var(--high-bg)]"
        >
          ×
        </button>
      </div>
    </div>
  );
}
