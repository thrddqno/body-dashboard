package com.antonio.bodydashboard.service.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

/**
 * Deterministic, weight-loss-centric readiness decision.
 *
 * This is a transparent rule-based heuristic. The AI interpretation layer must
 * treat the resulting verdict as a pre-computed fact and never recompute it.
 */
@Service
public class ReadinessDecisionService {

	public static final BigDecimal TARGET_WEIGHT_KG = new BigDecimal("80.0");

	private static final BigDecimal LOW_SLEEP_THRESHOLD_HOURS = new BigDecimal("6.0");
	private static final BigDecimal LOW_ADHERENCE_THRESHOLD_PERCENT = new BigDecimal("50.0");
	private static final BigDecimal GOOD_ADHERENCE_THRESHOLD_PERCENT = new BigDecimal("70.0");
	private static final BigDecimal ON_TARGET_WEIGHT_LOSS_KG = new BigDecimal("0.25");

	public ReadinessDecision decide(ReadinessDecision.Inputs inputs) {
		List<String> factors = new ArrayList<>();
		boolean hasWeight = inputs.weeklyWeightChangeKg().isPresent();
		boolean hasAdherence = inputs.adherencePercentage().isPresent();
		boolean hasSleep = inputs.averageSleepHours().isPresent();

		if (!hasWeight && !hasAdherence && !hasSleep) {
			factors.add("No weekly weight, adherence, or sleep data is available.");
			return new ReadinessDecision(ReadinessDecision.Verdict.INSUFFICIENT_DATA, false, factors);
		}

		Optional<BigDecimal> sleep = inputs.averageSleepHours();
		if (sleep.isPresent()) {
			addSleepFactor(factors, sleep.get());
		}

		Optional<BigDecimal> adherence = inputs.adherencePercentage();
		if (adherence.isPresent()) {
			addAdherenceFactor(factors, adherence.get());
		}

		Optional<BigDecimal> weightChange = inputs.weeklyWeightChangeKg();
		if (weightChange.isPresent()) {
			addWeightFactor(factors, weightChange.get());
		}

		boolean lowSleep = sleep.map(value -> value.compareTo(LOW_SLEEP_THRESHOLD_HOURS) < 0).orElse(false);
		boolean lowAdherence = adherence.map(value -> value.compareTo(LOW_ADHERENCE_THRESHOLD_PERCENT) < 0).orElse(false);

		if (lowSleep || lowAdherence) {
			return new ReadinessDecision(ReadinessDecision.Verdict.DELOAD, true, factors);
		}

		boolean goodAdherence = adherence.map(value -> value.compareTo(GOOD_ADHERENCE_THRESHOLD_PERCENT) >= 0).orElse(false);
		boolean onTargetWeightLoss = weightChange.map(value -> value.compareTo(ON_TARGET_WEIGHT_LOSS_KG) >= 0).orElse(false);

		if (onTargetWeightLoss && goodAdherence) {
			return new ReadinessDecision(ReadinessDecision.Verdict.PROGRESS, true, factors);
		}

		return new ReadinessDecision(ReadinessDecision.Verdict.MAINTAIN, true, factors);
	}

	private void addSleepFactor(List<String> factors, BigDecimal hours) {
		if (hours.compareTo(LOW_SLEEP_THRESHOLD_HOURS) < 0) {
			factors.add("Sleep averaged " + hours + "h, below the " + LOW_SLEEP_THRESHOLD_HOURS + "h recovery threshold.");
			return;
		}
		factors.add("Sleep averaged " + hours + "h, adequate for recovery.");
	}

	private void addAdherenceFactor(List<String> factors, BigDecimal percent) {
		BigDecimal percent1 = percent.setScale(1, RoundingMode.HALF_UP);
		if (percent.compareTo(LOW_ADHERENCE_THRESHOLD_PERCENT) < 0) {
			factors.add("Workout adherence was " + percent1 + "%, below the " + LOW_ADHERENCE_THRESHOLD_PERCENT + "% floor.");
		} else if (percent.compareTo(GOOD_ADHERENCE_THRESHOLD_PERCENT) >= 0) {
			factors.add("Workout adherence was " + percent1 + "%, at or above the " + GOOD_ADHERENCE_THRESHOLD_PERCENT + "% target.");
		} else {
			factors.add("Workout adherence was " + percent1 + "%.");
		}
	}

	private void addWeightFactor(List<String> factors, BigDecimal weeklyChangeKg) {
		BigDecimal rounded = weeklyChangeKg.setScale(2, RoundingMode.HALF_UP);
		if (weeklyChangeKg.compareTo(ON_TARGET_WEIGHT_LOSS_KG) >= 0) {
			factors.add("Weekly weight change was -" + rounded.abs() + "kg, on track toward the " + TARGET_WEIGHT_KG + "kg target.");
		} else {
			factors.add("Weekly weight change was " + (weeklyChangeKg.compareTo(BigDecimal.ZERO) < 0 ? "-" + rounded.abs() : "+" + rounded)
					+ "kg, below the " + ON_TARGET_WEIGHT_LOSS_KG + "kg weekly loss pace.");
		}
	}
}
