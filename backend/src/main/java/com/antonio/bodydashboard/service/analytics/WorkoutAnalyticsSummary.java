package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public record WorkoutAnalyticsSummary(
		LocalDate weekStart,
		LocalDate weekEnd,
		long completedWorkoutsThisWeek,
		long missedWorkoutsThisWeek,
		Optional<BigDecimal> adherencePercentage,
		List<WorkoutVolume> workoutVolumes,
		List<ExercisePersonalRecords> personalRecords) {

	public WorkoutAnalyticsSummary {
		adherencePercentage = adherencePercentage == null ? Optional.empty() : adherencePercentage;
		workoutVolumes = workoutVolumes == null ? List.of() : List.copyOf(workoutVolumes);
		personalRecords = personalRecords == null ? List.of() : List.copyOf(personalRecords);
	}

	public record WorkoutVolume(
			Long workoutId,
			LocalDate date,
			String workoutType,
			BigDecimal totalVolume) {
	}

	public record ExercisePersonalRecords(
			String exerciseName,
			Optional<SetRecord> highestWeight,
			List<SetRecord> highestRepsByWeight,
			Optional<ExerciseVolumeRecord> highestTotalVolume) {

		public ExercisePersonalRecords {
			highestWeight = highestWeight == null ? Optional.empty() : highestWeight;
			highestRepsByWeight = highestRepsByWeight == null ? List.of() : List.copyOf(highestRepsByWeight);
			highestTotalVolume = highestTotalVolume == null ? Optional.empty() : highestTotalVolume;
		}
	}

	public record SetRecord(
			Long workoutId,
			LocalDate date,
			String exerciseName,
			BigDecimal weightKg,
			int reps,
			BigDecimal volume) {
	}

	public record ExerciseVolumeRecord(
			Long workoutId,
			LocalDate date,
			String exerciseName,
			BigDecimal totalVolume) {
	}
}
