package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public record RecoveryAnalyticsSummary(
		LocalDate periodStart,
		LocalDate periodEnd,
		Optional<BigDecimal> averageSleepMinutes,
		Optional<Integer> averageSteps,
		long daysWithReportedEnergy) {

	public RecoveryAnalyticsSummary {
		averageSleepMinutes = averageSleepMinutes == null ? Optional.empty() : averageSleepMinutes;
		averageSteps = averageSteps == null ? Optional.empty() : averageSteps;
	}
}
