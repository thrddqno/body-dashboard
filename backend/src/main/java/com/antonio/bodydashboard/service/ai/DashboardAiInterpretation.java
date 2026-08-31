package com.antonio.bodydashboard.service.ai;

import java.time.Instant;
import java.util.List;

public record DashboardAiInterpretation(
        boolean available,
        String summary,
        List<String> insights,
        List<String> limitations,
        Instant generatedAt) {

    public DashboardAiInterpretation {
        summary = summary == null ? "" : summary;
        insights = insights == null ? List.of() : List.copyOf(insights);
        limitations = limitations == null ? List.of() : List.copyOf(limitations);
        generatedAt = generatedAt == null ? Instant.now() : generatedAt;
    }

    public static DashboardAiInterpretation unavailable(String reason) {
        return new DashboardAiInterpretation(false, "AI interpretation is not configured.", List.of(), List.of(reason), Instant.now());
    }
}
