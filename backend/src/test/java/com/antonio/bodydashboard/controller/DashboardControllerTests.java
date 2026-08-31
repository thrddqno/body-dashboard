package com.antonio.bodydashboard.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.EnergyLevel;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardControllerTests {

	private static final LocalDate FIXED_TODAY = LocalDate.of(2026, 8, 30);
	private static final ZoneId TEST_ZONE = ZoneId.systemDefault();

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
	void returnsCompleteDashboardSnapshot() throws Exception {
		LocalDate today = FIXED_TODAY;
		LocalDate yesterday = today.minusDays(1);
		saveDailyLog(today, 420, 5200, EnergyLevel.AVERAGE);
		saveBodyMetric(yesterday, "112.00");
		saveBodyMetric(today, "111.75");
		Workout workout = saveWorkout(today, "Strength", WorkoutStatus.COMPLETED);

		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.today.date").value(today.toString()))
				.andExpect(jsonPath("$.today.dailyLog.sleepMinutes").value(420))
				.andExpect(jsonPath("$.today.dailyLog.steps").value(5200))
				.andExpect(jsonPath("$.today.dailyLog.energy").value("AVERAGE"))
				.andExpect(jsonPath("$.body.currentWeightKg").value(111.75))
				.andExpect(jsonPath("$.body.targetWeightKg").value(80.0))
				.andExpect(jsonPath("$.body.weightRemainingKg").value(31.75))
				.andExpect(jsonPath("$.body.recentMetrics", hasSize(2)))
				.andExpect(jsonPath("$.body.recentMetrics[0].date").value(today.toString()))
				.andExpect(jsonPath("$.training.latestWorkout.id").value(workout.getId()))
				.andExpect(jsonPath("$.training.latestWorkout.date").value(today.toString()))
				.andExpect(jsonPath("$.training.latestWorkout.workoutType").value("Strength"))
				.andExpect(jsonPath("$.training.latestWorkout.status").value("COMPLETED"))
				.andExpect(jsonPath("$.training.completedThisWeek").value(1))
				.andExpect(jsonPath("$.training.missedThisWeek").value(0));
	}

	@Test
	void returnsNullDailyLogWhenNoDailyLogExistsForToday() throws Exception {
		LocalDate today = FIXED_TODAY;
		saveDailyLog(today.minusDays(1), 390, 4000, EnergyLevel.LOW);

		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.today.date").value(today.toString()))
				.andExpect(jsonPath("$.today.dailyLog").doesNotExist());
	}

	@Test
	void returnsEmptyBodySectionWhenNoBodyMetricsExist() throws Exception {
		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.body.currentWeightKg").doesNotExist())
				.andExpect(jsonPath("$.body.targetWeightKg").value(80.0))
				.andExpect(jsonPath("$.body.weightRemainingKg").doesNotExist())
				.andExpect(jsonPath("$.body.recentMetrics", hasSize(0)));
	}

	@Test
	void returnsEmptyTrainingSectionWhenNoWorkoutsExist() throws Exception {
		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.training.latestWorkout").doesNotExist())
				.andExpect(jsonPath("$.training.completedThisWeek").value(0))
				.andExpect(jsonPath("$.training.missedThisWeek").value(0));
	}

	@Test
	void countsCompletedAndMissedWorkoutsInCurrentCalendarWeek() throws Exception {
		LocalDate today = FIXED_TODAY;
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
		saveWorkout(weekStart, "Strength", WorkoutStatus.COMPLETED);
		saveWorkout(today, "Conditioning", WorkoutStatus.COMPLETED);
		saveWorkout(weekEnd, "Hypertrophy", WorkoutStatus.MISSED);
		saveWorkout(weekStart.minusDays(1), "Previous week", WorkoutStatus.COMPLETED);
		saveWorkout(weekEnd.plusDays(1), "Next week", WorkoutStatus.MISSED);
		saveWorkout(today, "Planned", WorkoutStatus.PLANNED);

		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.training.completedThisWeek").value(2))
				.andExpect(jsonPath("$.training.missedThisWeek").value(1));
	}

	@Test
	void excludesRestDaysFromDashboardTrainingCounts() throws Exception {
		saveWorkout(FIXED_TODAY, "REST", WorkoutStatus.COMPLETED);
		saveWorkout(FIXED_TODAY.minusDays(1), "rest", WorkoutStatus.MISSED);

		mockMvc.perform(get("/api/dashboard"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.training.completedThisWeek").value(0))
				.andExpect(jsonPath("$.training.missedThisWeek").value(0));
	}

	private BodyMetric saveBodyMetric(LocalDate date, String weightKg) {
		BodyMetric bodyMetric = new BodyMetric();
		bodyMetric.setDate(date);
		bodyMetric.setWeightKg(new BigDecimal(weightKg));
		return bodyMetricRepository.save(bodyMetric);
	}

	private DailyLog saveDailyLog(LocalDate date, Integer sleepMinutes, Integer steps, EnergyLevel energy) {
		DailyLog dailyLog = new DailyLog();
		dailyLog.setDate(date);
		dailyLog.setSleepMinutes(sleepMinutes);
		dailyLog.setSteps(steps);
		dailyLog.setEnergy(energy);
		return dailyLogRepository.save(dailyLog);
	}

	private Workout saveWorkout(LocalDate date, String workoutType, WorkoutStatus status) {
		Workout workout = new Workout();
		workout.setDate(date);
		workout.setWorkoutType(workoutType);
		workout.setStatus(status);
		return workoutRepository.save(workout);
	}

	@TestConfiguration
	static class FixedClockConfig {

		@Bean
		@Primary
		Clock fixedClock() {
			return Clock.fixed(Instant.parse("2026-08-30T12:00:00Z"), TEST_ZONE);
		}
	}
}
