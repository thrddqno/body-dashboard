package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklyAnalyticsResponse(
		Period period,
		Body body,
		Recovery recovery,
		Training training) {

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
