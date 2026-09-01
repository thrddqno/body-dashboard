package com.antonio.bodydashboard.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.dto.WorkoutResponse;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.service.WorkoutService;

class WorkoutMcpToolsTest {

	private final WorkoutService workoutService = mock(WorkoutService.class);
	private final WorkoutMcpTools tools = new WorkoutMcpTools(workoutService);

	@Test
	void delegatesInclusiveDateRangeToWorkoutService() {
		LocalDate from = LocalDate.of(2026, 8, 31);
		LocalDate to = LocalDate.of(2026, 9, 6);
		WorkoutResponse workout = workout(from, 1L);
		when(workoutService.getByDateRange(from, to)).thenReturn(List.of(workout));

		WorkoutMcpTools.WorkoutRangeResult result = tools.getWorkouts("2026-08-31", "2026-09-06");

		assertThat(result.workouts()).containsExactly(workout);
		verify(workoutService).getByDateRange(from, to);
	}

	@Test
	void returnsCleanEmptyDateResult() {
		LocalDate date = LocalDate.of(2026, 9, 1);
		when(workoutService.getByDate(date)).thenReturn(List.of());

		WorkoutMcpTools.WorkoutDateResult result = tools.getWorkoutByDate("2026-09-01");

		assertThat(result.found()).isFalse();
		assertThat(result.workouts()).isEmpty();
	}

	@Test
	void returnsAllWorkoutsRecordedOnDate() {
		LocalDate date = LocalDate.of(2026, 9, 1);
		when(workoutService.getByDate(date)).thenReturn(List.of(workout(date, 1L), workout(date, 2L)));

		assertThat(tools.getWorkoutByDate("2026-09-01").workouts()).hasSize(2);
	}

	@Test
	void rejectsInvalidDateBeforeCallingService() {
		assertThatIllegalArgumentException().isThrownBy(() -> tools.getWorkoutByDate("09/01/2026"))
				.withMessage("Invalid 'date': expected YYYY-MM-DD");
		verifyNoInteractions(workoutService);
	}

	@Test
	void rejectsReversedRangeThroughServiceValidation() {
		assertThatIllegalArgumentException().isThrownBy(() -> tools.getWorkouts("2026-09-02", "2026-09-01"))
				.withMessage("Workout date range 'from' must not be after 'to'");
		verifyNoInteractions(workoutService);
	}

	@Test
	void rejectsRangesLongerThanOneYearBeforeCallingService() {
		assertThatIllegalArgumentException().isThrownBy(() -> tools.getWorkouts("2025-01-01", "2026-01-02"))
				.withMessage("Workout date range must not exceed 366 days");
		verifyNoInteractions(workoutService);
	}

	private WorkoutResponse workout(LocalDate date, Long id) {
		return new WorkoutResponse(id, date, "PUSH", WorkoutStatus.COMPLETED, null, List.of(), null, null);
	}
}
