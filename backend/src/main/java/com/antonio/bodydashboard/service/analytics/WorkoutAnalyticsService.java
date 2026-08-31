package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.entity.ExerciseSet;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutExercise;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@Service
public class WorkoutAnalyticsService {

	private final Clock clock;
	private final WorkoutRepository workoutRepository;

	public WorkoutAnalyticsService(Clock clock, WorkoutRepository workoutRepository) {
		this.clock = clock;
		this.workoutRepository = workoutRepository;
	}

	@Transactional(readOnly = true)
	public WorkoutAnalyticsSummary summarizeCurrentWeek() {
		LocalDate today = LocalDate.now(clock);
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
		return summarizeWeek(weekStart, weekEnd);
	}

	@Transactional(readOnly = true)
	public WorkoutAnalyticsSummary summarizeWeek(LocalDate weekStart, LocalDate weekEnd) {
		List<Workout> workouts = workoutRepository.findAllByOrderByDateDescCreatedAtDesc();
		List<Workout> workoutsThisWeek = workouts.stream()
				.filter(workout -> isInPeriod(workout, weekStart, weekEnd))
				.toList();
		return summarize(weekStart, weekEnd, workoutsThisWeek, workouts);
	}

	public WorkoutAnalyticsSummary summarize(
			LocalDate weekStart,
			LocalDate weekEnd,
			List<Workout> workoutsThisWeek,
			List<Workout> allWorkouts) {
		List<Workout> weeklyWorkouts = nullSafe(workoutsThisWeek).stream()
				.filter(workout -> isInPeriod(workout, weekStart, weekEnd))
				.filter(this::isTrainingWorkout)
				.toList();
		List<Workout> trainingHistory = nullSafe(allWorkouts).stream()
				.filter(this::isTrainingWorkout)
				.toList();
		long completedWorkouts = countByStatus(weeklyWorkouts, WorkoutStatus.COMPLETED);
		long missedWorkouts = countByStatus(weeklyWorkouts, WorkoutStatus.MISSED);

		return new WorkoutAnalyticsSummary(
				weekStart,
				weekEnd,
				completedWorkouts,
				missedWorkouts,
				adherencePercentage(completedWorkouts, missedWorkouts),
				weeklyWorkoutVolumes(weeklyWorkouts),
				personalRecords(trainingHistory));
	}

	public BigDecimal exerciseSetVolume(ExerciseSet set) {
		return set.getWeightKg()
				.multiply(BigDecimal.valueOf(set.getReps()))
				.setScale(2, RoundingMode.HALF_UP);
	}

	public BigDecimal workoutVolume(Workout workout) {
		return nullSafe(workout.getExercises()).stream()
				.flatMap(exercise -> nullSafe(exercise.getSets()).stream())
				.map(this::exerciseSetVolume)
				.reduce(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), BigDecimal::add);
	}

	private Optional<BigDecimal> adherencePercentage(long completedWorkouts, long missedWorkouts) {
		long adherenceEligibleWorkouts = completedWorkouts + missedWorkouts;
		if (adherenceEligibleWorkouts == 0) {
			return Optional.empty();
		}

		return Optional.of(BigDecimal.valueOf(completedWorkouts * 100L)
				.divide(BigDecimal.valueOf(adherenceEligibleWorkouts), 2, RoundingMode.HALF_UP));
	}

	private List<WorkoutAnalyticsSummary.WorkoutVolume> weeklyWorkoutVolumes(List<Workout> weeklyWorkouts) {
		return weeklyWorkouts.stream()
				.filter(workout -> workout.getStatus() == WorkoutStatus.COMPLETED)
				.sorted(Comparator.comparing(Workout::getDate))
				.map(workout -> new WorkoutAnalyticsSummary.WorkoutVolume(
						workout.getId(),
						workout.getDate(),
						workout.getWorkoutType(),
						workoutVolume(workout)))
				.toList();
	}

	private List<WorkoutAnalyticsSummary.ExercisePersonalRecords> personalRecords(List<Workout> allWorkouts) {
		Map<String, List<SetWithContext>> setsByExercise = nullSafe(allWorkouts).stream()
				.filter(workout -> workout.getStatus() == WorkoutStatus.COMPLETED)
				.flatMap(workout -> nullSafe(workout.getExercises()).stream()
						.flatMap(exercise -> nullSafe(exercise.getSets()).stream()
								.map(set -> new SetWithContext(workout, exercise, set))))
				.collect(Collectors.groupingBy(context -> context.exercise().getExerciseName()));

		return setsByExercise.entrySet().stream()
				.sorted(Map.Entry.comparingByKey())
				.map(entry -> new WorkoutAnalyticsSummary.ExercisePersonalRecords(
						entry.getKey(),
						highestWeight(entry.getValue()),
						highestRepsByWeight(entry.getValue()),
						highestTotalVolume(entry.getKey(), allWorkouts)))
				.toList();
	}

	private Optional<WorkoutAnalyticsSummary.SetRecord> highestWeight(List<SetWithContext> sets) {
		return sets.stream()
				.max(Comparator.comparing((SetWithContext context) -> context.set().getWeightKg())
						.thenComparing(context -> context.set().getReps()))
				.map(this::toSetRecord);
	}

	private List<WorkoutAnalyticsSummary.SetRecord> highestRepsByWeight(List<SetWithContext> sets) {
		return sets.stream()
				.collect(Collectors.groupingBy(context -> context.set().getWeightKg()))
				.entrySet().stream()
				.sorted(Map.Entry.comparingByKey())
				.map(entry -> entry.getValue().stream()
						.max(Comparator.comparing((SetWithContext context) -> context.set().getReps()))
						.map(this::toSetRecord)
						.orElse(null))
				.filter(Objects::nonNull)
				.toList();
	}

	private Optional<WorkoutAnalyticsSummary.ExerciseVolumeRecord> highestTotalVolume(String exerciseName, List<Workout> allWorkouts) {
		return nullSafe(allWorkouts).stream()
				.filter(workout -> workout.getStatus() == WorkoutStatus.COMPLETED)
				.flatMap(workout -> nullSafe(workout.getExercises()).stream()
						.filter(exercise -> exerciseName.equals(exercise.getExerciseName()))
						.map(exercise -> toExerciseVolumeRecord(workout, exercise)))
				.max(Comparator.comparing(WorkoutAnalyticsSummary.ExerciseVolumeRecord::totalVolume));
	}

	private WorkoutAnalyticsSummary.SetRecord toSetRecord(SetWithContext context) {
		return new WorkoutAnalyticsSummary.SetRecord(
				context.workout().getId(),
				context.workout().getDate(),
				context.exercise().getExerciseName(),
				context.set().getWeightKg(),
				context.set().getReps(),
				exerciseSetVolume(context.set()));
	}

	private WorkoutAnalyticsSummary.ExerciseVolumeRecord toExerciseVolumeRecord(Workout workout, WorkoutExercise exercise) {
		BigDecimal totalVolume = nullSafe(exercise.getSets()).stream()
				.map(this::exerciseSetVolume)
				.reduce(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), BigDecimal::add);
		return new WorkoutAnalyticsSummary.ExerciseVolumeRecord(
				workout.getId(),
				workout.getDate(),
				exercise.getExerciseName(),
				totalVolume);
	}

	private boolean isInPeriod(Workout workout, LocalDate start, LocalDate end) {
		return !workout.getDate().isBefore(start) && !workout.getDate().isAfter(end);
	}

	private boolean isTrainingWorkout(Workout workout) {
		return workout.getWorkoutType() == null || !workout.getWorkoutType().trim().equalsIgnoreCase("REST");
	}

	private long countByStatus(List<Workout> workouts, WorkoutStatus status) {
		return workouts.stream()
				.filter(workout -> workout.getStatus() == status)
				.count();
	}

	private <T> List<T> nullSafe(List<T> values) {
		return values == null ? List.of() : values;
	}

	private record SetWithContext(Workout workout, WorkoutExercise exercise, ExerciseSet set) {
	}
}
