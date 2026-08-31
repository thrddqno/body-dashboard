import { Link } from "react-router-dom";

import { formatFullDateString } from "@/utils/formatters";

interface DashboardHeaderProps {
  today: string;
  periodLabel: string;
}

export function DashboardHeader({ today, periodLabel }: DashboardHeaderProps) {
  return (
    <header className="flex min-h-[300px] flex-col justify-center border-b border-[var(--line)] py-7 md:min-h-[360px] md:py-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">
            Current week · {periodLabel}
          </p>
          <h1 className="font-serif-display mt-5 max-w-4xl text-[clamp(3.75rem,8vw,7rem)] font-medium leading-[0.84] text-[var(--ink)]">
            Train from the state you have.
          </h1>
          <p className="mt-7 max-w-[650px] text-[17px] leading-[1.65] text-[var(--muted)]">
            Review completed and missed sessions, reported recovery, and current
            measurements before deciding what comes next.
          </p>
        </div>
        <div className="shrink-0 border-l border-[var(--line)] pl-5 text-left md:text-right">
          <div>
            <p className="eyebrow text-[var(--orange)]">
              Today
            </p>
            <p className="font-serif-display mt-2 max-w-52 text-2xl leading-tight text-[var(--ink)]">
              {formatFullDateString(today)}
            </p>
          </div>
          <Link
            to={`/daily-log/${today}`}
            className="button-primary mt-5"
          >
            Update check-in
          </Link>
        </div>
      </div>
    </header>
  );
}
