package com.antonio.bodydashboard.service.analytics;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.entity.ExerciseSet;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutExercise;
import com.antonio.bodydashboard.entity.WorkoutStatus;

class WorkoutAnalyticsServiceTest {

	private final WorkoutAnalyticsService service = new WorkoutAnalyticsService(Clock.systemUTC(), null);

	@Test
	void countsCompletedAndMissedWorkoutsThisWeekAndCalculatesAdherenceWhenPlansExist() {
		LocalDate weekStart = LocalDate.of(2026, 8, 24);
		LocalDate weekEnd = LocalDate.of(2026, 8, 30);

		WorkoutAnalyticsSummary summary = service.summarize(
				weekStart,
				weekEnd,
				List.of(
						workout(weekStart.minusDays(1), WorkoutStatus.COMPLETED),
						workout(weekStart, WorkoutStatus.COMPLETED),
						workout(weekStart.plusDays(2), WorkoutStatus.MISSED),
						workout(weekEnd, WorkoutStatus.PLANNED),
						workout(weekEnd.plusDays(1), WorkoutStatus.COMPLETED)),
				List.of());

		assertThat(summary.weekStart()).isEqualTo(weekStart);
		assertThat(summary.weekEnd()).isEqualTo(weekEnd);
		assertThat(summary.completedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(summary.missedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(summary.adherencePercentage()).hasValueSatisfying(value -> assertThat(value).isEqualByComparingTo("50.00"));
	}

	@Test
	void leavesAdherenceEmptyWhenNoPlannedWorkoutDataExistsForWeek() {
		LocalDate weekStart = LocalDate.of(2026, 8, 24);
		LocalDate weekEnd = LocalDate.of(2026, 8, 30);

		WorkoutAnalyticsSummary summary = service.summarize(weekStart, weekEnd, List.of(), List.of());

		assertThat(summary.completedWorkoutsThisWeek()).isZero();
		assertThat(summary.missedWorkoutsThisWeek()).isZero();
		assertThat(summary.adherencePercentage()).isEmpty();
	}

	@Test
	void excludesRestDaysFromWorkoutCountsAdherenceAndVolume() {
		LocalDate weekStart = LocalDate.of(2026, 8, 24);
		LocalDate weekEnd = LocalDate.of(2026, 8, 30);
		Workout completedRest = workout(weekStart, WorkoutStatus.COMPLETED);
		completedRest.setWorkoutType(" REST ");
		Workout missedRest = workout(weekStart.plusDays(4), WorkoutStatus.MISSED);
		missedRest.setWorkoutType("rest");

		WorkoutAnalyticsSummary summary = service.summarize(
				weekStart,
				weekEnd,
				List.of(completedRest, missedRest),
				List.of(completedRest, missedRest));

		assertThat(summary.completedWorkoutsThisWeek()).isZero();
		assertThat(summary.missedWorkoutsThisWeek()).isZero();
		assertThat(summary.adherencePercentage()).isEmpty();
		assertThat(summary.workoutVolumes()).isEmpty();
		assertThat(summary.personalRecords()).isEmpty();
	}

	@Test
	void calculatesSetVolumeAndTotalWorkoutVolumeFromStoredSets() {
		ExerciseSet benchSet = set("100.00", 5);
		Workout workout = workout(LocalDate.of(2026, 8, 24), WorkoutStatus.COMPLETED,
				exercise("Bench Press", benchSet, set("100.00", 3)),
				exercise("Row", set("80.00", 10)));

		assertThat(service.exerciseSetVolume(benchSet)).isEqualByComparingTo("500.00");
		assertThat(service.workoutVolume(workout)).isEqualByComparingTo("1600.00");

		WorkoutAnalyticsSummary summary = service.summarize(
				LocalDate.of(2026, 8, 24),
				LocalDate.of(2026, 8, 30),
				List.of(workout),
				List.of(workout));

		assertThat(summary.workoutVolumes()).singleElement().satisfies(volume ->
				assertThat(volume.totalVolume()).isEqualByComparingTo("1600.00"));
	}

	@Test
	void detectsPersonalRecordsFromCompletedWorkoutsOnly() {
		Workout olderCompleted = workout(LocalDate.of(2026, 8, 1), WorkoutStatus.COMPLETED,
				exercise("Bench Press", set("100.00", 5), set("100.00", 8)),
				exercise("Row", set("80.00", 10)));
		Workout newerCompleted = workout(LocalDate.of(2026, 8, 15), WorkoutStatus.COMPLETED,
				exercise("Bench Press", set("110.00", 3)),
				exercise("Row", set("85.00", 8)));
		Workout plannedWorkout = workout(LocalDate.of(2026, 8, 20), WorkoutStatus.PLANNED,
				exercise("Bench Press", set("150.00", 1)));
		Workout missedWorkout = workout(LocalDate.of(2026, 8, 21), WorkoutStatus.MISSED,
				exercise("Row", set("120.00", 1)));

		WorkoutAnalyticsSummary summary = service.summarize(
				LocalDate.of(2026, 8, 10),
				LocalDate.of(2026, 8, 16),
				List.of(newerCompleted),
				List.of(olderCompleted, newerCompleted, plannedWorkout, missedWorkout));

		WorkoutAnalyticsSummary.ExercisePersonalRecords benchRecords = summary.personalRecords().stream()
				.filter(records -> records.exerciseName().equals("Bench Press"))
				.findFirst()
				.orElseThrow();

		assertThat(benchRecords.highestWeight()).hasValueSatisfying(record -> {
			assertThat(record.weightKg()).isEqualByComparingTo("110.00");
			assertThat(record.reps()).isEqualTo(3);
		});
		assertThat(benchRecords.highestRepsByWeight())
				.extracting(WorkoutAnalyticsSummary.SetRecord::weightKg)
				.containsExactly(new BigDecimal("100.00"), new BigDecimal("110.00"));
		assertThat(benchRecords.highestRepsByWeight().getFirst().reps()).isEqualTo(8);
		assertThat(benchRecords.highestTotalVolume()).hasValueSatisfying(record ->
				assertThat(record.totalVolume()).isEqualByComparingTo("1300.00"));

		assertThat(summary.personalRecords()).noneMatch(records -> records.exerciseName().equals("Deadlift"));
		assertThat(summary.personalRecords().stream()
				.filter(records -> records.exerciseName().equals("Bench Press"))
				.findFirst()
				.orElseThrow()
				.highestWeight()
				.orElseThrow()
				.weightKg()).isLessThan(new BigDecimal("150.00"));
	}

	private Workout workout(LocalDate date, WorkoutStatus status, WorkoutExercise... exercises) {
		Workout workout = new Workout();
		workout.setDate(date);
		workout.setWorkoutType("Strength");
		workout.setStatus(status);
		for (WorkoutExercise exercise : exercises) {
			workout.addExercise(exercise);
		}
		return workout;
	}

	private WorkoutExercise exercise(String name, ExerciseSet... sets) {
		WorkoutExercise exercise = new WorkoutExercise();
		exercise.setExerciseName(name);
		exercise.setOrderIndex(1);
		for (ExerciseSet set : sets) {
			exercise.addSet(set);
		}
		return exercise;
	}

	private ExerciseSet set(String weightKg, int reps) {
		ExerciseSet set = new ExerciseSet();
		set.setSetNumber(1);
		set.setWeightKg(new BigDecimal(weightKg));
		set.setReps(reps);
		set.setWarmup(false);
		return set;
	}
}
