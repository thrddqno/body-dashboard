package com.antonio.bodydashboard.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.WeeklyAnalyticsResponse;
import com.antonio.bodydashboard.service.analytics.BodyAnalyticsService;
import com.antonio.bodydashboard.service.analytics.BodyPeriodAnalyticsSummary;
import com.antonio.bodydashboard.service.analytics.RecoveryAnalyticsService;
import com.antonio.bodydashboard.service.analytics.RecoveryAnalyticsSummary;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsSummary;

@Service
public class WeeklyAnalyticsService {

	private final BodyAnalyticsService bodyAnalyticsService;
	private final RecoveryAnalyticsService recoveryAnalyticsService;
	private final WorkoutAnalyticsService workoutAnalyticsService;
	private final Clock clock;

	public WeeklyAnalyticsService(
			BodyAnalyticsService bodyAnalyticsService,
			RecoveryAnalyticsService recoveryAnalyticsService,
			WorkoutAnalyticsService workoutAnalyticsService,
			Clock clock) {
		this.bodyAnalyticsService = bodyAnalyticsService;
		this.recoveryAnalyticsService = recoveryAnalyticsService;
		this.workoutAnalyticsService = workoutAnalyticsService;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public WeeklyAnalyticsResponse getCurrentWeekSummary() {
		LocalDate today = LocalDate.now(clock);
		LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		LocalDate end = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
		return getSummary(start, end);
	}

	WeeklyAnalyticsResponse getSummary(LocalDate start, LocalDate end) {
		BodyPeriodAnalyticsSummary body = bodyAnalyticsService.summarizePeriod(start, end);
		RecoveryAnalyticsSummary recovery = recoveryAnalyticsService.summarizeLastSevenDays(end);
		WorkoutAnalyticsSummary training = workoutAnalyticsService.summarizeWeek(start, end);

		return new WeeklyAnalyticsResponse(
				new WeeklyAnalyticsResponse.Period(start, end),
				buildBody(body),
				buildRecovery(recovery),
				buildTraining(training));
	}

	private WeeklyAnalyticsResponse.Body buildBody(BodyPeriodAnalyticsSummary body) {
		return new WeeklyAnalyticsResponse.Body(
				body.latestWeightKg().orElse(null),
				body.weightChangeKg().orElse(null));
	}

	private WeeklyAnalyticsResponse.Recovery buildRecovery(RecoveryAnalyticsSummary recovery) {
		BigDecimal averageSleepHours = recovery.averageSleepMinutes()
				.map(minutes -> minutes.divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP))
				.orElse(null);
		return new WeeklyAnalyticsResponse.Recovery(
				averageSleepHours,
				recovery.averageSteps().orElse(null));
	}

	private WeeklyAnalyticsResponse.Training buildTraining(WorkoutAnalyticsSummary training) {
		BigDecimal adherencePercentage = training.adherencePercentage()
				.map(value -> value.setScale(1, RoundingMode.HALF_UP))
				.orElse(null);
		return new WeeklyAnalyticsResponse.Training(
				training.completedWorkoutsThisWeek(),
				training.missedWorkoutsThisWeek(),
				adherencePercentage);
	}
}
