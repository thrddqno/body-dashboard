import { useId } from "react";

const workoutPageSizes = [7, 15, 30] as const;

interface WorkoutPaginationProps {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function WorkoutPagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: WorkoutPaginationProps) {
  const pageSizeId = useId();

  if (totalElements === 0) return null;

  return (
    <div className="border-t border-[var(--line)] pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor={pageSizeId}
          className="grid grid-cols-[auto_80px] items-center gap-2 text-sm font-bold text-[var(--ink)]"
        >
          <span>Items per page</span>
          <select
            id={pageSizeId}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={isLoading}
            className="form-control form-control-compact"
          >
            {workoutPageSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <p aria-live="polite" className="text-sm text-[var(--muted)]">
          Page {page + 1} of {totalPages} · {totalElements} workout{totalElements === 1 ? "" : "s"}
        </p>
      </div>
      <div role="group" aria-label="Workout history pages" className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={isLoading || page === 0}
          className="button-secondary"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || page + 1 >= totalPages}
          className="button-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
