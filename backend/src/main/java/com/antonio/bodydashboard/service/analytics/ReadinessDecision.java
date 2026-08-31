package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public record ReadinessDecision(
		Verdict verdict,
		boolean sufficientData,
		List<String> factors) {

	public ReadinessDecision {
		factors = factors == null ? List.of() : List.copyOf(factors);
	}

	public enum Verdict {
		PROGRESS,
		MAINTAIN,
		DELOAD,
		INSUFFICIENT_DATA
	}

	public record Inputs(
			Optional<BigDecimal> weeklyWeightChangeKg,
			Optional<BigDecimal> adherencePercentage,
			Optional<BigDecimal> averageSleepHours) {

		public Inputs {
			weeklyWeightChangeKg = weeklyWeightChangeKg == null ? Optional.empty() : weeklyWeightChangeKg;
			adherencePercentage = adherencePercentage == null ? Optional.empty() : adherencePercentage;
			averageSleepHours = averageSleepHours == null ? Optional.empty() : averageSleepHours;
		}
	}
}
