package com.antonio.bodydashboard.dto;

import java.time.Instant;
import java.util.List;

public record WeeklyAiAnalysisResponse(
		String summary,
		List<String> knownFacts,
		List<String> interpretation,
		List<String> strengths,
		List<String> concerns,
		List<String> recommendations,
		List<String> dataGaps,
		Instant generatedAt) {

	public WeeklyAiAnalysisResponse {
		summary = summary == null ? "" : summary;
		knownFacts = knownFacts == null ? List.of() : List.copyOf(knownFacts);
		interpretation = interpretation == null ? List.of() : List.copyOf(interpretation);
		strengths = strengths == null ? List.of() : List.copyOf(strengths);
		concerns = concerns == null ? List.of() : List.copyOf(concerns);
		recommendations = recommendations == null ? List.of() : List.copyOf(recommendations);
		dataGaps = dataGaps == null ? List.of() : List.copyOf(dataGaps);
		generatedAt = generatedAt == null ? Instant.now() : generatedAt;
	}

	public static WeeklyAiAnalysisResponse insufficientData(List<String> knownFacts, List<String> dataGaps) {
		return new WeeklyAiAnalysisResponse(
				"Log body metrics, recovery data, and workout outcomes this week before changing your training plan. The available evidence is too limited for a more specific coaching recommendation.",
				knownFacts,
				List.of("No trend or coaching interpretation was generated because the available facts are too limited."),
				List.of(),
				List.of("Not enough body, recovery, or completed/missed workout data exists for this week."),
				List.of("Log body metrics, daily recovery data, and workout outcomes before requesting weekly AI analysis."),
				dataGaps,
				Instant.now());
	}
}
