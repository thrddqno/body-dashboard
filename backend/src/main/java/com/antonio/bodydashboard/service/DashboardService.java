package com.antonio.bodydashboard.service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.BodyMetricResponse;
import com.antonio.bodydashboard.dto.DailyLogResponse;
import com.antonio.bodydashboard.dto.DashboardResponse;
import com.antonio.bodydashboard.dto.WorkoutSummaryResponse;
import com.antonio.bodydashboard.entity.BodyMetric;
import com.antonio.bodydashboard.entity.DailyLog;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.repository.BodyMetricRepository;
import com.antonio.bodydashboard.repository.DailyLogRepository;
import com.antonio.bodydashboard.repository.WorkoutRepository;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsSummary;

@Service
public class DashboardService {

	private static final int RECENT_BODY_METRIC_LIMIT = 30;
	private static final BigDecimal TARGET_WEIGHT_KG = new BigDecimal("80.0");

	private final Clock clock;
	private final BodyMetricRepository bodyMetricRepository;
	private final DailyLogRepository dailyLogRepository;
	private final WorkoutRepository workoutRepository;
	private final WorkoutAnalyticsService workoutAnalyticsService;

	public DashboardService(
			Clock clock,
			BodyMetricRepository bodyMetricRepository,
			DailyLogRepository dailyLogRepository,
			WorkoutRepository workoutRepository,
			WorkoutAnalyticsService workoutAnalyticsService) {
		this.clock = clock;
		this.bodyMetricRepository = bodyMetricRepository;
		this.dailyLogRepository = dailyLogRepository;
		this.workoutRepository = workoutRepository;
		this.workoutAnalyticsService = workoutAnalyticsService;
	}

	@Transactional(readOnly = true)
	public DashboardResponse getDashboard() {
		LocalDate today = LocalDate.now(clock);
		List<BodyMetricResponse> recentMetrics = bodyMetricRepository.findByOrderByDateDesc(PageRequest.of(0, RECENT_BODY_METRIC_LIMIT))
				.stream()
				.map(this::toBodyMetricResponse)
				.toList();
		LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
		WorkoutAnalyticsSummary trainingAnalytics = workoutAnalyticsService.summarizeWeek(weekStart, weekEnd);

		DashboardResponse.Today todayResponse = new DashboardResponse.Today(
				today,
				dailyLogRepository.findByDate(today).map(this::toDailyLogResponse).orElse(null));
		BigDecimal currentWeightKg = recentMetrics.isEmpty() ? null : recentMetrics.getFirst().weightKg();
		DashboardResponse.Body bodyResponse = new DashboardResponse.Body(
				currentWeightKg,
				TARGET_WEIGHT_KG,
				weightRemainingKg(currentWeightKg),
				recentMetrics);
		DashboardResponse.Training trainingResponse = new DashboardResponse.Training(
				workoutRepository.findFirstByOrderByDateDescIdDesc().map(this::toWorkoutSummaryResponse).orElse(null),
				trainingAnalytics.completedWorkoutsThisWeek(),
				trainingAnalytics.missedWorkoutsThisWeek());

		return new DashboardResponse(todayResponse, bodyResponse, trainingResponse);
	}

	private BigDecimal weightRemainingKg(BigDecimal currentWeightKg) {
		if (currentWeightKg == null) {
			return null;
		}
		return currentWeightKg.subtract(TARGET_WEIGHT_KG).max(BigDecimal.ZERO);
	}

	private BodyMetricResponse toBodyMetricResponse(BodyMetric bodyMetric) {
		return new BodyMetricResponse(
				bodyMetric.getId(),
				bodyMetric.getDate(),
				bodyMetric.getWeightKg(),
				bodyMetric.getWaistCm(),
				bodyMetric.getBodyFatPercentage(),
				bodyMetric.getCreatedAt());
	}

	private DailyLogResponse toDailyLogResponse(DailyLog dailyLog) {
		return new DailyLogResponse(
				dailyLog.getId(),
				dailyLog.getDate(),
				dailyLog.getSleepMinutes(),
				dailyLog.getSteps(),
				dailyLog.getEnergy(),
				dailyLog.getPainNotes(),
				dailyLog.getRecoveryNotes(),
				dailyLog.getEstimatedCalories(),
				dailyLog.getEstimatedProteinGrams(),
				dailyLog.getCreatedAt(),
				dailyLog.getUpdatedAt());
	}

	private WorkoutSummaryResponse toWorkoutSummaryResponse(Workout workout) {
		return new WorkoutSummaryResponse(
				workout.getId(),
				workout.getDate(),
				workout.getWorkoutType(),
				workout.getStatus(),
				workout.getNotes(),
				workout.getCreatedAt(),
				workout.getUpdatedAt());
	}
}
