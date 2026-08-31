package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public record BodyAnalyticsSummary(
		Optional<BigDecimal> latestWeightKg,
		Optional<LocalDate> latestWeightDate,
		Optional<BigDecimal> sevenDayWeightChangeKg,
		Optional<BigDecimal> thirtyDayWeightChangeKg,
		List<MovingAveragePoint> sevenDayMovingAverage) {

	public BodyAnalyticsSummary {
		latestWeightKg = latestWeightKg == null ? Optional.empty() : latestWeightKg;
		latestWeightDate = latestWeightDate == null ? Optional.empty() : latestWeightDate;
		sevenDayWeightChangeKg = sevenDayWeightChangeKg == null ? Optional.empty() : sevenDayWeightChangeKg;
		thirtyDayWeightChangeKg = thirtyDayWeightChangeKg == null ? Optional.empty() : thirtyDayWeightChangeKg;
		sevenDayMovingAverage = sevenDayMovingAverage == null ? List.of() : List.copyOf(sevenDayMovingAverage);
	}

	public record MovingAveragePoint(
			LocalDate date,
			BigDecimal averageWeightKg,
			int measurementCount) {
	}
}
