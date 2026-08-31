package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.util.Optional;

public record BodyPeriodAnalyticsSummary(
		Optional<BigDecimal> latestWeightKg,
		Optional<BigDecimal> weightChangeKg) {

	public BodyPeriodAnalyticsSummary {
		latestWeightKg = latestWeightKg == null ? Optional.empty() : latestWeightKg;
		weightChangeKg = weightChangeKg == null ? Optional.empty() : weightChangeKg;
	}
}
