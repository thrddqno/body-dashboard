package com.antonio.bodydashboard.service;

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
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@SpringBootTest
@ActiveProfiles("test")
class WeeklyAnalyticsServiceTest {

	@Autowired
	private WeeklyAnalyticsService weeklyAnalyticsService;

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
	void buildsCurrentWeekSummaryFromDeterministicData() {
		saveBodyMetric(LocalDate.of(2026, 8, 24), "112.25");
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		saveBodyMetric(LocalDate.of(2026, 8, 31), "111.50");

		saveDailyLog(LocalDate.of(2026, 8, 24), 360, 4600);
		saveDailyLog(LocalDate.of(2026, 8, 25), 390, 5000);
		saveDailyLog(LocalDate.of(2026, 8, 26), 366, 4800);
		saveDailyLog(LocalDate.of(2026, 8, 31), 600, 10000);

		saveWorkout(LocalDate.of(2026, 8, 24), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 25), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 26), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 27), WorkoutStatus.MISSED);
		saveWorkout(LocalDate.of(2026, 8, 31), WorkoutStatus.MISSED);

		var summary = weeklyAnalyticsService.getCurrentWeekSummary();

		assertThat(summary.period().start()).isEqualTo(LocalDate.of(2026, 8, 24));
		assertThat(summary.period().end()).isEqualTo(LocalDate.of(2026, 8, 30));
		assertThat(summary.body().latestWeightKg()).isEqualByComparingTo("111.75");
		assertThat(summary.body().weightChangeKg()).isEqualByComparingTo("-0.50");
		assertThat(summary.recovery().averageSleepHours()).isEqualByComparingTo("6.2");
		assertThat(summary.recovery().averageSteps()).isEqualTo(4800);
		assertThat(summary.training().completedWorkouts()).isEqualTo(3);
		assertThat(summary.training().missedWorkouts()).isEqualTo(1);
		assertThat(summary.training().adherencePercentage()).isEqualByComparingTo("75.0");
	}

	@Test
	void returnsEmptyFactsWhenCurrentWeekHasNoData() {
		var summary = weeklyAnalyticsService.getCurrentWeekSummary();

		assertThat(summary.period().start()).isEqualTo(LocalDate.of(2026, 8, 24));
		assertThat(summary.period().end()).isEqualTo(LocalDate.of(2026, 8, 30));
		assertThat(summary.body().latestWeightKg()).isNull();
		assertThat(summary.body().weightChangeKg()).isNull();
		assertThat(summary.recovery().averageSleepHours()).isNull();
		assertThat(summary.recovery().averageSteps()).isNull();
		assertThat(summary.training().completedWorkouts()).isZero();
		assertThat(summary.training().missedWorkouts()).isZero();
		assertThat(summary.training().adherencePercentage()).isNull();
	}

	private BodyMetric saveBodyMetric(LocalDate date, String weightKg) {
		BodyMetric bodyMetric = new BodyMetric();
		bodyMetric.setDate(date);
		bodyMetric.setWeightKg(new BigDecimal(weightKg));
		return bodyMetricRepository.save(bodyMetric);
	}

	private DailyLog saveDailyLog(LocalDate date, Integer sleepMinutes, Integer steps) {
		DailyLog dailyLog = new DailyLog();
		dailyLog.setDate(date);
		dailyLog.setSleepMinutes(sleepMinutes);
		dailyLog.setSteps(steps);
		return dailyLogRepository.save(dailyLog);
	}

	private Workout saveWorkout(LocalDate date, WorkoutStatus status) {
		Workout workout = new Workout();
		workout.setDate(date);
		workout.setWorkoutType("Strength");
		workout.setStatus(status);
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
