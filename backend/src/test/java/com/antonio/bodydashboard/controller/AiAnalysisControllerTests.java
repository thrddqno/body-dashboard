package com.antonio.bodydashboard.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.exception.AiProviderException;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;
import com.antonio.bodydashboard.repository.WeeklyAiAnalysisRepository;
import com.antonio.bodydashboard.service.ai.AiProvider;
import com.antonio.bodydashboard.service.ai.AnalysisContext;
import com.antonio.bodydashboard.service.ai.AnalysisResult;
import com.antonio.bodydashboard.service.ai.DashboardAiInterpretation;
import com.antonio.bodydashboard.service.ai.DashboardAnalysisContext;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiAnalysisControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private BodyMetricRepository bodyMetricRepository;

	@Autowired
	private DailyLogRepository dailyLogRepository;

	@Autowired
	private WorkoutRepository workoutRepository;

	@Autowired
	private WeeklyAiAnalysisRepository weeklyAiAnalysisRepository;

	@Autowired
	private FakeAiProvider aiProvider;

	@BeforeEach
	void setUp() {
		weeklyAiAnalysisRepository.deleteAll();
		workoutRepository.deleteAll();
		dailyLogRepository.deleteAll();
		bodyMetricRepository.deleteAll();
		aiProvider.reset();
	}

	@Test
	void returnsSuccessfulWeeklyAiAnalysisFromDeterministicAnalyticsContext() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 24), "112.25");
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		saveDailyLog(LocalDate.of(2026, 8, 24), 360, 4600);
		saveWorkout(LocalDate.of(2026, 8, 24), WorkoutStatus.COMPLETED);
		saveWorkout(LocalDate.of(2026, 8, 27), WorkoutStatus.MISSED);

		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.summary").value("Known facts indicate a productive but incomplete week."))
				.andExpect(jsonPath("$.knownFacts", hasItem("Analysis period: Monday, Aug 24, 2026 to Sunday, Aug 30, 2026")))
				.andExpect(jsonPath("$.knownFacts", hasItem("Average sleep: 6.0 hours")))
				.andExpect(jsonPath("$.knownFacts", hasItem("Completed workouts: 1")))
				.andExpect(jsonPath("$.knownFacts", hasItem("Missed workouts: 1")))
				.andExpect(jsonPath("$.interpretation", hasItem("Training adherence is mixed because one workout was completed and one was missed.")))
				.andExpect(jsonPath("$.strengths", hasItem("One workout was completed.")))
				.andExpect(jsonPath("$.concerns", hasItem("The missed workout should be reviewed in context.")))
				.andExpect(jsonPath("$.recommendations", hasItem("Keep logging workouts, body metrics, sleep, and steps before drawing stronger conclusions.")));

		assertThat(aiProvider.analysisCallCount).isEqualTo(1);
		assertThat(aiProvider.capturedContext.currentWeek().start()).isEqualTo(LocalDate.of(2026, 8, 24));
		assertThat(aiProvider.capturedContext.currentWeek().end()).isEqualTo(LocalDate.of(2026, 8, 30));
		assertThat(aiProvider.capturedContext.training().completedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(aiProvider.capturedContext.training().missedWorkoutsThisWeek()).isEqualTo(1);
		assertThat(weeklyAiAnalysisRepository.count()).isEqualTo(1);
	}

	@Test
	void returnsLatestPersistedWeeklyAnalysis() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/ai-analysis/weekly/latest"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.summary").value("Known facts indicate a productive but incomplete week."))
				.andExpect(jsonPath("$.generatedAt").exists());
	}

	@Test
	void returnsInsufficientDataWithoutAskingProviderToGuess() throws Exception {
		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.summary").value("Log body metrics, recovery data, and workout outcomes this week before changing your training plan. The available evidence is too limited for a more specific coaching recommendation."))
				.andExpect(jsonPath("$.interpretation", hasItem("No trend or coaching interpretation was generated because the available facts are too limited.")))
				.andExpect(jsonPath("$.strengths", hasSize(0)))
				.andExpect(jsonPath("$.concerns", hasItem("Not enough body, recovery, or completed/missed workout data exists for this week.")))
				.andExpect(jsonPath("$.recommendations", hasItem("Log body metrics, daily recovery data, and workout outcomes before requesting weekly AI analysis.")))
				.andExpect(jsonPath("$.dataGaps", hasItem("No body weight metrics are available.")))
				.andExpect(jsonPath("$.dataGaps", hasItem("Workout adherence is unavailable because no planned workout data exists for the current week.")));

		assertThat(aiProvider.analysisCallCount).isZero();
	}

	@Test
	void returnsServiceUnavailableWhenProviderFails() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		aiProvider.failWeeklyAnalysis = true;

		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isServiceUnavailable())
				.andExpect(jsonPath("$.message").value("AI analysis provider failed"));

		assertThat(aiProvider.analysisCallCount).isEqualTo(1);
	}

	@Test
	void returnsTooManyRequestsWhenProviderRateLimitIsExceeded() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		aiProvider.rateLimitWeeklyAnalysis = true;

		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isTooManyRequests())
				.andExpect(jsonPath("$.message").value("AI provider rate limit exceeded. Try again later."));

		assertThat(aiProvider.analysisCallCount).isEqualTo(1);
	}

	@Test
	void doesNotReturnFabricatedFallbackAnalysisWhenProviderFails() throws Exception {
		saveBodyMetric(LocalDate.of(2026, 8, 30), "111.75");
		aiProvider.failWeeklyAnalysis = true;

		mockMvc.perform(post("/api/ai-analysis/weekly").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isServiceUnavailable())
				.andExpect(jsonPath("$.summary").doesNotExist())
				.andExpect(jsonPath("$.strengths").doesNotExist())
				.andExpect(jsonPath("$.concerns").doesNotExist())
				.andExpect(jsonPath("$.recommendations").doesNotExist());
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
	static class TestConfig {

		@Bean
		@Primary
		Clock fixedClock() {
			return Clock.fixed(Instant.parse("2026-08-30T12:00:00Z"), ZoneOffset.UTC);
		}

		@Bean
		@Primary
		FakeAiProvider fakeAiProvider() {
			return new FakeAiProvider();
		}
	}

	static class FakeAiProvider implements AiProvider {
		private int analysisCallCount;
		private boolean failWeeklyAnalysis;
		private boolean rateLimitWeeklyAnalysis;
		private AnalysisContext capturedContext;

		@Override
		public AnalysisResult analyze(AnalysisContext context) {
			analysisCallCount++;
			capturedContext = context;
			if (rateLimitWeeklyAnalysis) {
				throw new AiProviderException(
						"Provider rate limited",
						null,
						AiProviderException.FailureReason.RATE_LIMITED,
						429);
			}
			if (failWeeklyAnalysis) {
				throw new AiProviderException("Provider failed", null);
			}

			return new AnalysisResult(
					true,
					"Known facts indicate a productive but incomplete week.",
					List.of("Training adherence is mixed because one workout was completed and one was missed."),
					List.of("One workout was completed."),
					List.of("The missed workout should be reviewed in context."),
					List.of("Keep logging workouts, body metrics, sleep, and steps before drawing stronger conclusions."),
					Instant.EPOCH);
		}

		@Override
		public DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context) {
			return DashboardAiInterpretation.unavailable("Dashboard AI interpretation is not used by this test.");
		}

		void reset() {
			analysisCallCount = 0;
			failWeeklyAnalysis = false;
			rateLimitWeeklyAnalysis = false;
			capturedContext = null;
		}
	}
}
