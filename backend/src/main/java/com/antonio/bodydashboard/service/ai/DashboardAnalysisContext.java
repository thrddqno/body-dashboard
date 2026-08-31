package com.antonio.bodydashboard.service.ai;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardAnalysisContext(
        LocalDate periodStart,
        LocalDate periodEnd,
        Map<String, Object> metrics,
        List<String> trends,
        List<String> dataGaps) {

    public DashboardAnalysisContext {
        metrics = metrics == null ? Map.of() : Map.copyOf(metrics);
        trends = trends == null ? List.of() : List.copyOf(trends);
        dataGaps = dataGaps == null ? List.of() : List.copyOf(dataGaps);
    }
}
