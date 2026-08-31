package com.antonio.bodydashboard.service.ai;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.entity.WorkoutStatus;

public record AnalysisContext(
		Instant generatedAt,
		Period currentWeek,
		BodyFacts body,
		RecoveryFacts recovery,
		TrainingFacts training,
		List<RecentDailyLog> recentDailyLogs,
		List<RecentWorkout> recentWorkouts,
		List<String> dataGaps) {

	public AnalysisContext {
		generatedAt = generatedAt == null ? Instant.now() : generatedAt;
		recentDailyLogs = recentDailyLogs == null ? List.of() : List.copyOf(recentDailyLogs);
		recentWorkouts = recentWorkouts == null ? List.of() : List.copyOf(recentWorkouts);
		dataGaps = dataGaps == null ? List.of() : List.copyOf(dataGaps);
	}

	public record Period(LocalDate start, LocalDate end) {
	}

	public record BodyFacts(
			BigDecimal latestWeightKg,
			LocalDate latestWeightDate,
			BigDecimal sevenDayWeightChangeKg,
			BigDecimal thirtyDayWeightChangeKg) {
	}

	public record RecoveryFacts(
			LocalDate periodStart,
			LocalDate periodEnd,
			BigDecimal averageSleepHours,
			Integer averageSteps,
			long daysWithReportedEnergy) {
	}

	public record TrainingFacts(
			LocalDate weekStart,
			LocalDate weekEnd,
			long completedWorkoutsThisWeek,
			long missedWorkoutsThisWeek,
			BigDecimal adherencePercentage,
			List<WorkoutVolumeFact> workoutVolumes,
			List<PersonalRecordFact> personalRecords) {

		public TrainingFacts {
			workoutVolumes = workoutVolumes == null ? List.of() : List.copyOf(workoutVolumes);
			personalRecords = personalRecords == null ? List.of() : List.copyOf(personalRecords);
		}
	}

	public record WorkoutVolumeFact(
			Long workoutId,
			LocalDate date,
			String workoutType,
			BigDecimal totalVolume) {
	}

	public record PersonalRecordFact(
			String exerciseName,
			BigDecimal highestWeightKg,
			Integer repsAtHighestWeight,
			BigDecimal highestSetVolume,
			BigDecimal highestWorkoutExerciseVolume) {
	}

	public record RecentDailyLog(
			LocalDate date,
			BigDecimal sleepHours,
			Integer steps,
			EnergyLevel energy,
			String painNotes,
			String recoveryNotes) {
	}

	public record RecentWorkout(
			Long id,
			LocalDate date,
			String workoutType,
			WorkoutStatus status,
			String notes) {
	}
}
