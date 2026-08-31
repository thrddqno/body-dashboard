import { StatusBadge } from "@/components/StatusBadge";
import type { Workout, WorkoutStatus } from "@/types/workout";
import { formatFullDateString, formatMetricValue, formatNullableText } from "@/utils/formatters";

interface WorkoutDetailProps {
  workout: Workout;
  isUpdatingStatus: boolean;
  statusError?: string;
  onStatusChange: (status: WorkoutStatus) => Promise<void>;
}

export function WorkoutDetail({
  workout,
  isUpdatingStatus,
  statusError,
  onStatusChange,
}: WorkoutDetailProps) {
  return (
    <section className="panel p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">
            Workout detail
          </p>
          <h1 className="font-serif-display mt-2 text-4xl font-medium text-[var(--ink)]">{workout.workoutType}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">{formatFullDateString(workout.date)}</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <StatusBadge status={workout.status} />
          <label className="text-sm text-[var(--ink)]">
            <span className="sr-only">Workout status</span>
            <select
              value={workout.status}
              disabled={isUpdatingStatus}
              onChange={(event) => void onStatusChange(event.target.value as WorkoutStatus)}
              className="form-control py-2 text-sm"
            >
              <option value="PLANNED">Planned</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSED">Missed</option>
            </select>
          </label>
        </div>
      </div>
      <p className="mt-6 text-sm leading-6 text-[var(--muted)]">{formatNullableText(workout.notes)}</p>
      {workout.status === "MISSED" ? <p className="mt-4 rounded-[8px] bg-[var(--high-bg)] px-3 py-2 text-xs font-bold text-[var(--rose)]">Missed and not completed. Do not stack or double this workout.</p> : null}
      <p className="mt-4 text-sm text-[var(--muted)]">
        Date, notes, and exercise content are read-only after creation. Only status can be updated with the current API.
      </p>
      {statusError ? <p className="mt-4 text-sm text-[var(--rose)]">{statusError}</p> : null}
      <div className="mt-6 space-y-4">
        {workout.exercises.length === 0 ? <p className="text-sm text-[var(--muted)]">No exercise details reported.</p> : null}
        {workout.exercises.map((exercise) => (
          <div key={exercise.id} className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] p-5">
            <p className="text-lg font-bold text-[var(--ink)]">{exercise.exerciseName}</p>
            <div className="mt-4 overflow-x-auto">
              {exercise.sets.length === 0 ? <p className="text-sm text-[var(--muted)]">No sets reported.</p> : null}
              <table className="min-w-full text-left text-sm text-[var(--ink)]">
                <thead className="text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="pb-3 font-medium">Set</th>
                    <th className="pb-3 font-medium">Weight</th>
                    <th className="pb-3 font-medium">Reps</th>
                    <th className="pb-3 font-medium">RIR</th>
                    <th className="pb-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => (
                    <tr key={set.id} className="border-t border-[var(--line)]">
                      <td className="py-3">{set.setNumber}</td>
                      <td className="py-3">{formatMetricValue(set.weightKg, "kg")}</td>
                      <td className="py-3">{set.reps}</td>
                      <td className="py-3">{set.rir == null ? "Not recorded" : set.rir}</td>
                      <td className="py-3">{set.warmup ? "Warm-up" : "Working set"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
