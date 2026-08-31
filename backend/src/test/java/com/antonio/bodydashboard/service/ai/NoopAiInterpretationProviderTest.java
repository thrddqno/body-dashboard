package com.antonio.bodydashboard.service.ai;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class NoopAiInterpretationProviderTest {

    @Test
    void returnsUnavailableInterpretationWhenAiIsNotConfigured() {
        NoopAiInterpretationProvider provider = new NoopAiInterpretationProvider();

        DashboardAiInterpretation interpretation = provider.interpretDashboard(new DashboardAnalysisContext(null, null, null, null, null));

        assertThat(interpretation.available()).isFalse();
        assertThat(interpretation.summary()).contains("not configured");
        assertThat(interpretation.limitations()).isNotEmpty();
        assertThat(interpretation.generatedAt()).isNotNull();
    }
}
