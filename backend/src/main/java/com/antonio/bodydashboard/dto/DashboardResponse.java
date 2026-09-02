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
			BigDecimal activeTargetKg,
			BigDecimal weightRemainingKg,
			Goal goal,
			List<BodyMetricResponse> recentMetrics) {
	}

	/**
	 * Staged goal summary. The active target is the Stage 1 milestone; the
	 * stage 2 range is a future/reassessment target, not the current
	 * completion threshold.
	 */
	public record Goal(
			LocalDate baselineDate,
			BigDecimal baselineWeightKg,
			BigDecimal stage1TargetKg,
			BigDecimal stage2MinKg,
			BigDecimal stage2MaxKg,
			Integer calorieTargetKcal,
			Integer estimatedMaintenanceMinKcal,
			Integer estimatedMaintenanceMaxKcal,
			BigDecimal minWeightLossKgPerWeek,
			BigDecimal maxWeightLossKgPerWeek) {
	}

	public record Training(
			WorkoutSummaryResponse latestWorkout,
			long completedThisWeek,
			long missedThisWeek) {
	}
}
