package com.antonio.bodydashboard.service.analytics;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.antonio.bodydashboard.config.FitnessGoals;

class ReadinessDecisionServiceTest {

	private final ReadinessDecisionService service = new ReadinessDecisionService(new FitnessGoals());

	@Test
	void returnsInsufficientDataWhenNoWeightAdherenceOrSleepIsAvailable() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.empty(), Optional.empty(), Optional.empty()));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.INSUFFICIENT_DATA);
		assertThat(decision.sufficientData()).isFalse();
		assertThat(decision.factors()).containsExactly("No weekly weight, adherence, or sleep data is available.");
	}

	@Test
	void decidesDeloadWhenSleepIsBelowThreshold() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.30")),
				Optional.of(new BigDecimal("90.0")),
				Optional.of(new BigDecimal("5.5"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.DELOAD);
		assertThat(decision.sufficientData()).isTrue();
		assertThat(decision.factors()).anySatisfy(factor ->
				assertThat(factor).contains("Sleep averaged 5.5h", "recovery threshold"));
	}

	@Test
	void decidesDeloadWhenAdherenceIsBelowFloor() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.30")),
				Optional.of(new BigDecimal("40.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.DELOAD);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesProgressWhenWeightOnTrackAndAdherenceGood() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.50")),
				Optional.of(new BigDecimal("80.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.PROGRESS);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesMaintainWhenWeightOnTrackButAdherenceIsLacking() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.50")),
				Optional.of(new BigDecimal("55.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesMaintainJustBelowMinimumLossPaceDespiteGoodAdherence() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.49")),
				Optional.of(new BigDecimal("85.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
		assertThat(decision.factors()).anySatisfy(factor -> assertThat(factor).contains("below the 0.5kg weekly loss pace"));
	}

	@Test
	void decidesProgressAtMaximumLossPace() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.80")),
				Optional.of(new BigDecimal("85.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.PROGRESS);
	}

	@Test
	void decidesMaintainAboveMaximumLossPace() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.81")),
				Optional.of(new BigDecimal("85.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.factors()).anySatisfy(factor -> assertThat(factor).contains("above the 0.8kg weekly loss pace"));
	}

	@Test
	void doesNotClassifyWeightGainAsOnTargetLoss() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("0.50")),
				Optional.of(new BigDecimal("85.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.factors()).anySatisfy(factor -> assertThat(factor).contains("+0.50kg", "below the 0.5kg weekly loss pace"));
	}

	@Test
	void decidesFromPartialDataWhenOnlySleepIsPresent() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.empty(), Optional.empty(), Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void referencesTheActiveStage1TargetOf104KgNot90Kg() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("-0.50")),
				Optional.of(new BigDecimal("80.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.factors()).anySatisfy(factor -> {
			assertThat(factor).contains("104kg target");
			assertThat(factor).doesNotContain("90kg");
			assertThat(factor).doesNotContain("80kg");
		});
	}

	@Test
	void fitnessGoalsUses104AsActiveTargetWithStage2AsReassessmentRange() {
		FitnessGoals goals = new FitnessGoals();

		assertThat(goals.activeTargetKg()).isEqualByComparingTo("104");
		assertThat(goals.stage2MinKg()).isEqualByComparingTo("100");
		assertThat(goals.stage2MaxKg()).isEqualByComparingTo("101");
		assertThat(goals.activeTargetKg()).isNotEqualByComparingTo("90");
	}

	@Test
	void calorieTargetIsDistinctFromEstimatedMaintenance() {
		assertThat(FitnessGoals.CALORIE_TARGET_KCAL).isEqualTo(2500);
		assertThat(FitnessGoals.ESTIMATED_MAINTENANCE_MIN_KCAL).isEqualTo(3000);
		assertThat(FitnessGoals.ESTIMATED_MAINTENANCE_MAX_KCAL).isEqualTo(3300);
		assertThat(FitnessGoals.CALORIE_TARGET_KCAL)
				.isNotEqualTo(FitnessGoals.ESTIMATED_MAINTENANCE_MIN_KCAL)
				.isNotEqualTo(FitnessGoals.ESTIMATED_MAINTENANCE_MAX_KCAL);
	}
}
