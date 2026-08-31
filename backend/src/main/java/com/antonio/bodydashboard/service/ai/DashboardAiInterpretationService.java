package com.antonio.bodydashboard.service.ai;

import org.springframework.stereotype.Service;

@Service
public class DashboardAiInterpretationService {

    private final AiInterpretationProvider aiInterpretationProvider;

    public DashboardAiInterpretationService(AiInterpretationProvider aiInterpretationProvider) {
        this.aiInterpretationProvider = aiInterpretationProvider;
    }

    public DashboardAiInterpretation interpret(DashboardAnalysisContext context) {
        return aiInterpretationProvider.interpretDashboard(context);
    }
}
