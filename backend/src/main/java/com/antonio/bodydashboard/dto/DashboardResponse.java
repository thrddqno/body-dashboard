package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardResponse(
		Today today,
		Body body,
		Training training) {

	public record Today(
			LocalDate date,
			DailyLogResponse dailyLog) {
	}

	public record Body(
			BigDecimal currentWeightKg,
			BigDecimal targetWeightKg,
			BigDecimal weightRemainingKg,
			List<BodyMetricResponse> recentMetrics) {
	}

	public record Training(
			WorkoutSummaryResponse latestWorkout,
			long completedThisWeek,
			long missedThisWeek) {
	}
}
