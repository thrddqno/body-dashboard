import type { WorkoutStatus } from "@/types/workout";

import { formatWorkoutStatus } from "@/utils/formatters";

interface StatusBadgeProps {
  status: WorkoutStatus;
}

const statusClasses: Record<WorkoutStatus, string> = {
  PLANNED: "border-[#e3c894] bg-[#f4ead2] text-[#9b6525]",
  COMPLETED: "border-[#bdd6c1] bg-[#dfebde] text-[var(--green)]",
  MISSED: "border-[#e3b9ae] bg-[#f3ded7] text-[var(--rose)]",
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
