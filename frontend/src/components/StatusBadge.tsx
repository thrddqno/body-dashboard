import type { WorkoutStatus } from "@/types/workout";

import { formatWorkoutStatus } from "@/utils/formatters";

interface StatusBadgeProps {
  status: WorkoutStatus;
}

const statusClasses: Record<WorkoutStatus, string> = {
  PLANNED: "border-[var(--medium-line)] bg-[var(--medium-bg)] text-[var(--medium-copy)]",
  COMPLETED: "border-[var(--low-line)] bg-[var(--low-bg)] text-[var(--green)]",
  MISSED: "border-[var(--high-line)] bg-[var(--high-bg)] text-[var(--rose)]",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-[8px] border px-2.5 py-1 text-[10px] font-black uppercase ${statusClasses[status]}`}
    >
      {formatWorkoutStatus(status)}
    </span>
  );
}
