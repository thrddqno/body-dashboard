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
  onChange: (
    field: "weightKg" | "reps" | "rir" | "warmup",
    value: string | boolean,
  ) => void;
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

  const weightError = fieldErrors[`${base}.weightKg`];
  const repsError = fieldErrors[`${base}.reps`];
  const rirError = fieldErrors[`${base}.rir`];
  const warmupError = fieldErrors[`${base}.warmup`];

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-[44px_minmax(90px,1fr)_70px_70px_auto_36px]">
        <div className="pt-2">
          <span className="text-xs font-semibold text-[var(--muted)]">
            Set {setIndex + 1}
          </span>
        </div>

        <div className="col-span-2 min-w-0 sm:col-span-1">
          <label htmlFor={`${idBase}-weight`} className="sr-only">
            Weight (kg)
          </label>

          <div className="relative">
            <input
              id={`${idBase}-weight`}
              type="number"
              step="0.01"
              min="0"
              value={value.weightKg}
              onChange={(event) => onChange("weightKg", event.target.value)}
              placeholder="0"
              className="form-control form-control-compact form-control-with-unit"
              aria-invalid={Boolean(weightError)}
              aria-describedby={weightError ? `${idBase}-weight-error` : undefined}
              required
            />

            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[11px] text-[var(--muted)]">
              kg
            </span>
          </div>

          <FieldError id={`${idBase}-weight-error`} message={weightError} />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${idBase}-reps`} className="sr-only">
            Reps
          </label>

          <input
            id={`${idBase}-reps`}
            type="number"
            min="1"
            value={value.reps}
            onChange={(event) => onChange("reps", event.target.value)}
            placeholder="Reps"
            className="form-control form-control-compact text-center"
            aria-invalid={Boolean(repsError)}
            aria-describedby={repsError ? `${idBase}-reps-error` : undefined}
            required
          />

          <FieldError id={`${idBase}-reps-error`} message={repsError} />
        </div>

        <div className="min-w-0">
          <label htmlFor={`${idBase}-rir`} className="sr-only">
            RIR
          </label>

          <input
            id={`${idBase}-rir`}
            type="number"
            min="0"
            max="10"
            value={value.rir}
            onChange={(event) => onChange("rir", event.target.value)}
            placeholder="RIR"
            className="form-control form-control-compact text-center"
            aria-invalid={Boolean(rirError)}
            aria-describedby={rirError ? `${idBase}-rir-error` : undefined}
          />

          <FieldError id={`${idBase}-rir-error`} message={rirError} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <div className="flex h-9 items-center">
            <label htmlFor={`${idBase}-warmup`} className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs text-[var(--muted)]">
              <input
                id={`${idBase}-warmup`}
                type="checkbox"
                checked={value.warmup}
                onChange={(event) => onChange("warmup", event.target.checked)}
                className="form-checkbox"
                aria-invalid={Boolean(warmupError)}
                aria-describedby={warmupError ? `${idBase}-warmup-error` : undefined}
              />
              <span>Warm-up</span>
            </label>
          </div>
          <FieldError id={`${idBase}-warmup-error`} message={warmupError} />
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove set ${setIndex + 1}`}
          title={`Remove set ${setIndex + 1}`}
          className="col-start-2 row-start-1 inline-grid h-9 w-9 place-items-center justify-self-end rounded-[6px] text-lg leading-none text-[var(--rose)] transition hover:bg-[var(--high-bg)] sm:col-start-auto sm:row-start-auto"
        >
          ×
        </button>
      </div>
    </div>
  );
}
