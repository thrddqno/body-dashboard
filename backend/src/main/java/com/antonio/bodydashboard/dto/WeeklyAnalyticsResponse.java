package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklyAnalyticsResponse(
		Period period,
		Body body,
		Recovery recovery,
		Training training,
		Decision decision) {

	public record Decision(
			String verdict,
			boolean sufficientData,
			java.util.List<String> factors) {
	}

	public record Period(
			LocalDate start,
			LocalDate end) {
	}

	public record Body(
			BigDecimal latestWeightKg,
			BigDecimal weightChangeKg) {
	}

	public record Recovery(
			BigDecimal averageSleepHours,
			Integer averageSteps) {
	}

	public record Training(
			long completedWorkouts,
			long missedWorkouts,
			BigDecimal adherencePercentage) {
	}
}
