package com.antonio.bodydashboard.service.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

class AiCoachServiceTest {

	@Test
	void delegatesStructuredContextToProviderWithoutVendorDependency() {
		CapturingProvider provider = new CapturingProvider();
		AiCoachService service = new AiCoachService(null, provider);
		AnalysisContext context = minimalContext();

		AnalysisResult result = service.analyze(context);

		assertThat(provider.context).isSameAs(context);
		assertThat(result.available()).isTrue();
		assertThat(result.summary()).isEqualTo("Provider-generated interpretation");
	}

	@Test
	void noOpProviderKeepsApplicationBehaviorSafeWhenAiIsNotConfigured() {
		NoopAiInterpretationProvider provider = new NoopAiInterpretationProvider();

		AnalysisResult result = provider.analyze(minimalContext());

		assertThat(result.available()).isFalse();
		assertThat(result.summary()).contains("not configured");
		assertThat(result.concerns()).isNotEmpty();
	}

	private AnalysisContext minimalContext() {
		return new AnalysisContext(
				Instant.EPOCH,
				new AnalysisContext.Period(LocalDate.of(2026, 8, 24), LocalDate.of(2026, 8, 30)),
				new AnalysisContext.BodyFacts(null, null, null, null),
				new AnalysisContext.RecoveryFacts(LocalDate.of(2026, 8, 24), LocalDate.of(2026, 8, 30), null, null, 0),
				new AnalysisContext.TrainingFacts(LocalDate.of(2026, 8, 24), LocalDate.of(2026, 8, 30), 0, 0, null, List.of(), List.of()),
				List.of(),
				List.of(),
				List.of("No data available."));
	}

	private static class CapturingProvider implements AiProvider {
		private AnalysisContext context;

		@Override
		public AnalysisResult analyze(AnalysisContext context) {
			this.context = context;
			return new AnalysisResult(true, "Provider-generated interpretation", List.of("Observation"), List.of(), List.of(), List.of("Priority"), Instant.EPOCH);
		}

		@Override
		public DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context) {
			return DashboardAiInterpretation.unavailable("Dashboard interpretation is not used by this test.");
		}
	}
}
