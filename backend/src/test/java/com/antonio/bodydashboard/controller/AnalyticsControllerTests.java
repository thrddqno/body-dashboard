package com.antonio.bodydashboard.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsControllerTests {

	@Autowired
	private MockMvc mockMvc;

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
	void returnsWeeklyAnalyticsSummary() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 24), "112.25");
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		saveDailyLog(LocalDate.of(2026, 8, 24), 360, 4600);
		saveDailyLog(LocalDate.of(2026, 8, 25), 390, 5000);
		saveDailyLog(LocalDate.of(2026, 8, 26), 366, 4800);
		saveWorkout(LocalDate.of(2026, 8, 24), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 25), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 26), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 27), WorkoutStatus.MISSED);

		mockMvc.perform(get("/api/analytics/weekly"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.period.start").value("2026-08-24"))
				.andExpect(jsonPath("$.period.end").value("2026-08-30"))
				.andExpect(jsonPath("$.body.latestWeightKg").value(111.75))
				.andExpect(jsonPath("$.body.weightChangeKg").value(-0.50))
				.andExpect(jsonPath("$.recovery.averageSleepHours").value(6.2))
				.andExpect(jsonPath("$.recovery.averageSteps").value(4800))
				.andExpect(jsonPath("$.training.completedWorkouts").value(3))
				.andExpect(jsonPath("$.training.missedWorkouts").value(1))
				.andExpect(jsonPath("$.training.adherencePercentage").value(75.0));
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
