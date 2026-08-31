package com.antonio.bodydashboard.service.analytics;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;

class ReadinessDecisionServiceTest {

	private final ReadinessDecisionService service = new ReadinessDecisionService();

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
				Optional.of(new BigDecimal("0.30")),
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
				Optional.of(new BigDecimal("0.30")),
				Optional.of(new BigDecimal("40.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.DELOAD);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesProgressWhenWeightOnTrackAndAdherenceGood() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("0.50")),
				Optional.of(new BigDecimal("80.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.PROGRESS);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesMaintainWhenWeightOnTrackButAdherenceIsLacking() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("0.50")),
				Optional.of(new BigDecimal("55.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesMaintainWhenWeightBelowPaceDespiteGoodAdherence() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.of(new BigDecimal("0.05")),
				Optional.of(new BigDecimal("85.0")),
				Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
	}

	@Test
	void decidesFromPartialDataWhenOnlySleepIsPresent() {
		ReadinessDecision decision = service.decide(new ReadinessDecision.Inputs(
				Optional.empty(), Optional.empty(), Optional.of(new BigDecimal("8.0"))));

		assertThat(decision.verdict()).isEqualTo(ReadinessDecision.Verdict.MAINTAIN);
		assertThat(decision.sufficientData()).isTrue();
	}
}
