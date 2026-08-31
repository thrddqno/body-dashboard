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
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  return (
    <section className="pt-11">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Weekly calendar</p>
          <h2 className="section-title mt-2">Training week</h2>
        </div>
        <p className="mobile-optional text-right text-xs leading-5 text-[var(--muted)]">
          {timezone}<br />Select a day to inspect records.
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
                : "border-t-[#9aa3af]";
          const isToday = date === today;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={selected}
              className={`relative min-h-44 rounded-[8px] border border-t-4 p-4 text-left transition duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,24,39,0.08)] ${stateBorder} ${
                isToday
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "bg-white text-[var(--ink)]"
              }`}
            >
              {selected ? (
                <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${isToday ? "bg-[var(--lime)] text-[var(--ink)]" : "bg-[var(--ink)] text-white"}`}>
                  Selected
                </span>
              ) : null}
              <span className={`text-[10px] font-black uppercase ${isToday ? "text-[var(--lime)]" : "text-[var(--muted)]"}`}>
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="font-serif-display mt-3 block text-[26px] leading-none">
                {formatCompactDateString(date)}
              </span>
              <div className="mt-5 space-y-2">
                <span className={`text-[10px] font-black uppercase ${isToday ? "text-[#cbd5e1]" : "text-[var(--muted)]"}`}>
                  {isToday ? "Today · " : ""}{workouts.length} workout record{workouts.length === 1 ? "" : "s"}
                </span>
                {primaryWorkout ? (
                  <div>
                    <p className={`truncate text-sm font-bold ${isToday ? "text-white" : "text-[var(--ink)]"}`}>
                      {primaryWorkout.workoutType}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={primaryWorkout.status} />
                    </div>
                  </div>
                ) : (
                  <p className={`text-xs ${isToday ? "text-[#cbd5e1]" : "text-[var(--muted)]"}`}>No workout reported</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
