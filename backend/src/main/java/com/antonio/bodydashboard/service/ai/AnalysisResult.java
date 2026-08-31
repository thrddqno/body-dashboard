package com.antonio.bodydashboard.service.ai;

import java.time.Instant;
import java.util.List;

public record AnalysisResult(
		boolean available,
		String summary,
		List<String> interpretation,
		List<String> strengths,
		List<String> concerns,
		List<String> recommendations,
		Instant generatedAt) {

	public AnalysisResult {
		summary = summary == null ? "" : summary;
		interpretation = interpretation == null ? List.of() : List.copyOf(interpretation);
		strengths = strengths == null ? List.of() : List.copyOf(strengths);
		concerns = concerns == null ? List.of() : List.copyOf(concerns);
		recommendations = recommendations == null ? List.of() : List.copyOf(recommendations);
		generatedAt = generatedAt == null ? Instant.now() : generatedAt;
	}

	public static AnalysisResult unavailable(String reason) {
		return new AnalysisResult(
				false,
				"AI coaching analysis is not configured.",
				List.of(),
				List.of(),
				List.of(reason),
				List.of(reason),
				Instant.now());
	}
}
