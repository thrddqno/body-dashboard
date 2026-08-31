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

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-white p-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Weight (kg)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={value.weightKg}
            onChange={(event) => onChange("weightKg", event.target.value)}
            className="form-control mt-2 w-full font-normal"
            required
          />
          {fieldErrors[`${base}.weightKg`] ? <p className="mt-1 text-sm text-[var(--rose)]">{fieldErrors[`${base}.weightKg`]}</p> : null}
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">Reps</span>
          <input
            type="number"
            min="1"
            value={value.reps}
            onChange={(event) => onChange("reps", event.target.value)}
            className="form-control mt-2 w-full font-normal"
            required
          />
          {fieldErrors[`${base}.reps`] ? <p className="mt-1 text-sm text-[var(--rose)]">{fieldErrors[`${base}.reps`]}</p> : null}
        </label>
        <label className="text-sm text-[var(--ink)]">
          <span className="font-bold">RIR</span>
          <input
            type="number"
            min="0"
            max="10"
            value={value.rir}
            onChange={(event) => onChange("rir", event.target.value)}
            className="form-control mt-2 w-full font-normal"
          />
          {fieldErrors[`${base}.rir`] ? <p className="mt-1 text-sm text-[var(--rose)]">{fieldErrors[`${base}.rir`]}</p> : null}
        </label>
        <div className="flex items-center md:items-end">
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={value.warmup}
              onChange={(event) => onChange("warmup", event.target.checked)}
              className="h-4 w-4 accent-[var(--green)]"
            />
            <span className="font-bold">Warm-up</span>
          </label>
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
