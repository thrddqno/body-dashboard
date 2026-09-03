import { StatusBadge } from "@/components/StatusBadge";
import type { Workout } from "@/types/workout";
import { parseLocalDate } from "@/utils/dates";
import { formatCompactDateString } from "@/utils/formatters";

interface WeeklyCalendarProps {
  dates: string[];
  today: string;
  workoutsByDate: Record<string, Workout[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeeklyCalendar({
  dates,
  today,
  workoutsByDate,
  selectedDate,
  onSelectDate,
}: WeeklyCalendarProps) {
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  return (
    <section className="pt-11">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Weekly calendar</p>
          <h2 className="section-title mt-2">Training week</h2>
        </div>
        <p className="mobile-optional text-right text-xs leading-5 text-[var(--muted)]">
          {timezone}
          <br />
          Select a day to inspect records.
        </p>
      </div>
      <div className="calendar-grid mt-6 grid grid-cols-7 gap-3">
        {dates.map((date) => {
          const day = parseLocalDate(date);
          const selected = date === selectedDate;
          const workouts = workoutsByDate[date] ?? [];
          const primaryWorkout = workouts[0];
          const statuses = new Set(workouts.map((workout) => workout.status));
          const stateBorder = statuses.has("MISSED")
            ? "border-t-[var(--rose)]"
            : statuses.has("COMPLETED")
              ? "border-t-[var(--green)]"
              : statuses.has("PLANNED")
                ? "border-t-[var(--orange)]"
                : "border-t-[var(--neutral-line)]";
          const isToday = date === today;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={selected}
              className={`relative flex min-h-44 flex-col justify-between rounded-[8px] border border-t-4 p-4 text-left transition duration-[180ms] hover:-translate-y-0.5 hover:border-[var(--selected-border)] hover:shadow-[var(--surface-shadow)] ${stateBorder} ${
                isToday
                  ? "border-[var(--today-border)] bg-[var(--today-bg)] text-[var(--on-strong)] ring-1 ring-inset ring-[var(--today-border)]"
                  : "border-[var(--control-border)] bg-[var(--card)] text-[var(--ink)]"
              } ${selected && !isToday ? "ring-2 ring-[var(--selected-border)]" : ""}`}
            >
              <div className="flex flex-col">
                {selected ? (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span
                      className={`text-[10px] font-black uppercase ${
                        isToday ? "text-[var(--lime)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {isToday ? "Today · " : ""}
                      {day.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${
                        isToday
                          ? "bg-[var(--lime)] text-[var(--on-lime)]"
                          : "bg-[var(--strong-surface)] text-[var(--on-strong)]"
                      }`}
                    >
                      Selected
                    </span>
                  </div>
                ) : (
                  <span
                    className={`text-[10px] font-black uppercase ${
                      isToday ? "text-[var(--lime)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {isToday ? "Today · " : ""}
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                )}

                <span className="font-serif-display mt-3 block text-[26px] leading-none">
                  {formatCompactDateString(date)}
                </span>
              </div>

              <div className="mt-5 space-y-2">
                <span
                  className={`text-[10px] font-black uppercase ${
                    isToday ? "text-[var(--today-muted)]" : "text-[var(--muted)]"
                  }`}
                >
                  {workouts.length} workout record
                  {workouts.length === 1 ? "" : "s"}
                </span>

                {primaryWorkout ? (
                  <div>
                    <p
                      className={`truncate text-sm font-bold ${
                        isToday ? "text-[var(--on-strong)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {primaryWorkout.workoutType}
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={primaryWorkout.status} />
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-xs ${
                      isToday ? "text-[var(--today-muted)]" : "text-[var(--muted)]"
                    }`}
                  >
                    No workout reported
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
