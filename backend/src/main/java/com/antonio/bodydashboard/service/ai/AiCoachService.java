package com.antonio.bodydashboard.service.ai;

import org.springframework.stereotype.Service;

@Service
public class AiCoachService {

	private final AnalysisContextBuilder analysisContextBuilder;
	private final AiProvider aiProvider;

	public AiCoachService(AnalysisContextBuilder analysisContextBuilder, AiProvider aiProvider) {
		this.analysisContextBuilder = analysisContextBuilder;
		this.aiProvider = aiProvider;
	}

	public AnalysisResult analyzeCurrentDashboard() {
		return analyze(analysisContextBuilder.buildCurrentDashboardContext());
	}

	AnalysisResult analyze(AnalysisContext context) {
		return aiProvider.analyze(context);
	}
}
