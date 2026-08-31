package com.antonio.bodydashboard.service.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class DashboardAiInterpretationServiceTest {

	@Test
	void delegatesStructuredContextToConfiguredProvider() {
		CapturingProvider provider = new CapturingProvider();
		DashboardAiInterpretationService service = new DashboardAiInterpretationService(provider);
		DashboardAnalysisContext context = new DashboardAnalysisContext(
				LocalDate.of(2026, 1, 1),
				LocalDate.of(2026, 1, 7),
				Map.of("averageSleepMinutes", 420),
				List.of("sleep increased"),
				List.of("missing body fat readings"));

		DashboardAiInterpretation interpretation = service.interpret(context);

		assertThat(provider.context).isSameAs(context);
		assertThat(interpretation.available()).isTrue();
		assertThat(interpretation.summary()).isEqualTo("Provider interpretation");
	}

	private static class CapturingProvider implements AiInterpretationProvider {
		private DashboardAnalysisContext context;

		@Override
		public DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context) {
			this.context = context;
			return new DashboardAiInterpretation(true, "Provider interpretation", List.of("insight"), List.of(), Instant.EPOCH);
		}

		@Override
		public AnalysisResult analyze(AnalysisContext context) {
			return new AnalysisResult(true, "Analysis", List.of(), List.of(), List.of(), List.of(), Instant.EPOCH);
		}
	}
}
