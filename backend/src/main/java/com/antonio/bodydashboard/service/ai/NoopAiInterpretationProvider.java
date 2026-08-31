package com.antonio.bodydashboard.service.ai;

public class NoopAiInterpretationProvider implements AiInterpretationProvider {

	private static final String NOT_CONFIGURED_REASON = "Set AI_INTERPRETATION_PROVIDER and related environment variables to enable AI analysis.";

	@Override
	public DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context) {
		return DashboardAiInterpretation.unavailable(NOT_CONFIGURED_REASON);
	}

	@Override
	public AnalysisResult analyze(AnalysisContext context) {
		return AnalysisResult.unavailable(NOT_CONFIGURED_REASON);
	}
}
