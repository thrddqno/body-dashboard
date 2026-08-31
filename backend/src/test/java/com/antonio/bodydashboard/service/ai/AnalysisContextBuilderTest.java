package com.antonio.bodydashboard.service.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;

import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.entity.ExerciseSet;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutExercise;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@SpringBootTest
@ActiveProfiles("test")
class AnalysisContextBuilderTest {

	@Autowired
	private AnalysisContextBuilder analysisContextBuilder;

	@Autowired
	private BodyMetricRepository bodyMetricRepository;

	@Autowired
	private DailyLogRepository dailyLogRepository;

	@Autowired
	private WorkoutRepository workoutRepository;

	@BeforeEach
	void setUp() {
		workoutRepository.deleteAll();
		dailyLogRepository.deleteAll();
		bodyMetricRepository.deleteAll();
	}

	@Test
	void buildsContextFromDeterministicAnalyticsAndRecentLogs() {
		saveBodyMetric(LocalDate.of(2026, 8, 23), "113.00");
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.50");
		saveBodyMetric(LocalDate.of(2026, 7, 31), "115.00");

		saveDailyLog(LocalDate.of(2026, 8, 29), 420, 7000, EnergyLevel.AVERAGE, null, "Normal recovery");
		saveDailyLog(LocalDate.of(2026, 8, 30), 480, 9000, EnergyLevel.HIGH, "Mild knee soreness", null);

		saveWorkout(LocalDate.of(2026, 8, 26), "PULL", WorkoutStatus.COMPLETED, "Good session", "Lat Pulldown", "50.00", 12);
		saveWorkout(LocalDate.of(2026, 8, 28), "PUSH", WorkoutStatus.MISSED, null, "Bench Press", "0.00", 10);

		AnalysisContext context = analysisContextBuilder.buildCurrentDashboardContext();

		assertThat(context.generatedAt()).isEqualTo(Instant.parse("2026-08-30T12:00:00Z"));
		assertThat(context.currentWeek().start()).isEqualTo(LocalDate.of(2026, 8, 24));
		assertThat(context.currentWeek().end()).isEqualTo(LocalDate.of(2026, 8, 30));
		assertThat(context.body().latestWeightKg()).isEqualByComparingTo("111.50");
		assertThat(context.body().sevenDayWeightChangeKg()).isEqualByComparingTo("-1.50");
		assertThat(context.body().thirtyDayWeightChangeKg()).isEqualByComparingTo("-3.50");
		assertThat(context.recovery().averageSleepHours()).isEqualByComparingTo("7.5");
		assertThat(context.recovery().averageSteps()).isEqualTo(8000);
		assertThat(context.training().completedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(context.training().missedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(context.training().adherencePercentage()).isEqualByComparingTo("50.00");
		assertThat(context.training().workoutVolumes()).singleElement().satisfies(volume -> {
			assertThat(volume.workoutType()).isEqualTo("PULL");
			assertThat(volume.totalVolume()).isEqualByComparingTo("600.00");
		});
		assertThat(context.training().personalRecords()).singleElement().satisfies(record -> {
			assertThat(record.exerciseName()).isEqualTo("Lat Pulldown");
			assertThat(record.highestWeightKg()).isEqualByComparingTo("50.00");
			assertThat(record.repsAtHighestWeight()).isEqualTo(12);
		});
		assertThat(context.recentDailyLogs())
				.extracting(AnalysisContext.RecentDailyLog::date)
				.containsExactly(LocalDate.of(2026, 8, 30), LocalDate.of(2026, 8, 29));
		assertThat(context.recentDailyLogs().getFirst().sleepHours()).isEqualByComparingTo("8.0");
		assertThat(context.recentWorkouts())
				.extracting(AnalysisContext.RecentWorkout::date)
				.containsExactly(LocalDate.of(2026, 8, 28), LocalDate.of(2026, 8, 26));
		assertThat(context.dataGaps()).isEmpty();
	}

	@Test
	void recordsDataGapsWithoutInventingMissingFacts() {
		AnalysisContext context = analysisContextBuilder.buildCurrentDashboardContext();

		assertThat(context.body().latestWeightKg()).isNull();
		assertThat(context.recovery().averageSleepHours()).isNull();
		assertThat(context.training().adherencePercentage()).isNull();
		assertThat(context.dataGaps()).contains(
				"No body weight metrics are available.",
				"Average sleep is unavailable for the current seven-day recovery window.",
				"Workout adherence is unavailable because no planned workout data exists for the current week.");
	}

	private BodyMetric saveBodyMetric(LocalDate date, String weightKg) {
		BodyMetric bodyMetric = new BodyMetric();
		bodyMetric.setDate(date);
		bodyMetric.setWeightKg(new BigDecimal(weightKg));
		return bodyMetricRepository.save(bodyMetric);
	}

	private DailyLog saveDailyLog(LocalDate date, Integer sleepMinutes, Integer steps, EnergyLevel energy, String painNotes, String recoveryNotes) {
		DailyLog dailyLog = new DailyLog();
		dailyLog.setDate(date);
		dailyLog.setSleepMinutes(sleepMinutes);
		dailyLog.setSteps(steps);
		dailyLog.setEnergy(energy);
		dailyLog.setPainNotes(painNotes);
		dailyLog.setRecoveryNotes(recoveryNotes);
		return dailyLogRepository.save(dailyLog);
	}

	private Workout saveWorkout(
			LocalDate date,
			String workoutType,
			WorkoutStatus status,
			String notes,
			String exerciseName,
			String weightKg,
			int reps) {
		Workout workout = new Workout();
		workout.setDate(date);
		workout.setWorkoutType(workoutType);
		workout.setStatus(status);
		workout.setNotes(notes);
		WorkoutExercise exercise = new WorkoutExercise();
		exercise.setExerciseName(exerciseName);
		exercise.setOrderIndex(1);
		ExerciseSet set = new ExerciseSet();
		set.setSetNumber(1);
		set.setWeightKg(new BigDecimal(weightKg));
		set.setReps(reps);
		set.setWarmup(false);
		exercise.addSet(set);
		workout.addExercise(exercise);
		return workoutRepository.save(workout);
	}

	@TestConfiguration
	static class FixedClockConfig {

		@Bean
		@Primary
		Clock fixedClock() {
			return Clock.fixed(Instant.parse("2026-08-30T12:00:00Z"), ZoneOffset.UTC);
		}
	}
}
