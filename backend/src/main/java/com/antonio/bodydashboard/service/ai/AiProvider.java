package com.antonio.bodydashboard.service.ai;

public interface AiProvider {

	AnalysisResult analyze(AnalysisContext context);

	DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context);
}
