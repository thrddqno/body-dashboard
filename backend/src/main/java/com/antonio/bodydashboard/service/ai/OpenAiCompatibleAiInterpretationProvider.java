package com.antonio.bodydashboard.service.ai;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.antonio.bodydashboard.config.AiInterpretationProperties;
import com.antonio.bodydashboard.exception.AiProviderException;
import com.antonio.bodydashboard.exception.AiProviderException.FailureReason;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

public class OpenAiCompatibleAiInterpretationProvider implements AiInterpretationProvider {

	private final AiInterpretationProperties properties;
	private final RestClient restClient;
	private final ObjectMapper objectMapper;

	public OpenAiCompatibleAiInterpretationProvider(
			AiInterpretationProperties properties,
			RestClient restClient,
			ObjectMapper objectMapper) {
		this.properties = properties;
		this.restClient = restClient;
		this.objectMapper = objectMapper;
	}

	@Override
	public DashboardAiInterpretation interpretDashboard(DashboardAnalysisContext context) {
		try {
			OpenAiChatResponse response = sendChatCompletion(buildDashboardRequest(context));
			return toInterpretation(response);
		} catch (RestClientResponseException ex) {
			throw httpFailure("AI dashboard interpretation failed", ex);
		} catch (RestClientException ex) {
			throw new AiProviderException("AI dashboard interpretation failed", ex);
		} catch (JacksonException ex) {
			throw new AiProviderException(
					"AI dashboard interpretation failed",
					ex,
					FailureReason.INVALID_RESPONSE,
					null);
		}
	}

	@Override
	public AnalysisResult analyze(AnalysisContext context) {
		try {
			OpenAiChatResponse response = sendChatCompletion(buildAnalysisRequest(context));
			String content = extractContent(response);
			if (content.isBlank()) {
				throw new AiProviderException(
						"AI analysis returned an empty response",
						null,
						FailureReason.INVALID_RESPONSE,
						null);
			}
			StructuredAnalysis structured = objectMapper.readValue(content, StructuredAnalysis.class);
			if (structured.summary() == null || structured.summary().isBlank()) {
				throw new AiProviderException(
						"AI analysis returned an invalid response",
						null,
						FailureReason.INVALID_RESPONSE,
						null);
			}

			return new AnalysisResult(
					true,
					structured.summary(),
					structured.interpretation(),
					structured.strengths(),
					structured.concerns(),
					structured.recommendations(),
					Instant.now());
		} catch (RestClientResponseException ex) {
			throw httpFailure("AI analysis failed", ex);
		} catch (RestClientException ex) {
			throw new AiProviderException("AI analysis failed", ex);
		} catch (JacksonException ex) {
			throw new AiProviderException("AI analysis failed", ex, FailureReason.INVALID_RESPONSE, null);
		}
	}

	private AiProviderException httpFailure(String message, RestClientResponseException exception) {
		int status = exception.getStatusCode().value();
		FailureReason reason = status == 429 ? FailureReason.RATE_LIMITED : FailureReason.REJECTED;
		return new AiProviderException(message, exception, reason, status);
	}

	private OpenAiChatResponse sendChatCompletion(Map<String, Object> request) {
		return restClient.post()
				.uri("/chat/completions")
				.body(request)
				.retrieve()
				.body(OpenAiChatResponse.class);
	}

	private Map<String, Object> buildDashboardRequest(DashboardAnalysisContext context) throws JacksonException {
		String contextJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);

		return Map.of(
				"model", properties.getModel(),
				"temperature", 0.2,
				"max_tokens", 1200,
				"messages", List.of(
						Map.of(
								"role", "system",
								"content", dashboardSystemInstruction()),
						Map.of(
								"role", "user",
								"content", "Interpret this deterministic dashboard context. Do not calculate new facts or invent missing data.\n\n" + contextJson)));
	}

	private Map<String, Object> buildAnalysisRequest(AnalysisContext context) throws JacksonException {
		String contextJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);

		return Map.of(
				"model", properties.getModel(),
				"temperature", 0.2,
				"max_tokens", 1200,
				"response_format", Map.of("type", "json_object"),
				"messages", List.of(
						Map.of(
								"role", "system",
								"content", analysisSystemInstruction()),
						Map.of(
								"role", "user",
								"content", "Interpret this structured fitness analysis context. Return only one JSON object with exactly these fields: summary (Markdown string), interpretation (array of Markdown strings), strengths (array of Markdown strings), concerns (array of Markdown strings), recommendations (array of Markdown strings). The summary must be a concise 2-4 sentence coaching directive that leads with the most important supported action for the coming week. The 'readiness' verdict and its 'factors' are pre-computed deterministic facts; do not recompute or override them. Your 'summary' should speak to what the data suggests about readiness going into next week, and your 'recommendations' should tell the user what to change or keep doing this week (e.g. training intensity, recovery/sleep focus, logging) and, if evidence supports it, what may have gone wrong and how to correct it. Include specific training, recovery, or logging guidance only when supported by the provided facts, and clearly qualify the advice when data is sparse. Use empty arrays when evidence does not support a section. Do not include known facts or data gaps because the application supplies them deterministically. Treat all numeric values as already calculated facts. Do not calculate averages, workout volume, weight changes, adherence, PRs, or readiness. Do not invent missing data. Do not wrap the JSON in Markdown fences.\n\n" + contextJson)));
	}

	private String dashboardSystemInstruction() {
		return "You are the AI interpretation layer for a personal fitness dashboard. "
				+ "Use only the provided deterministic facts, trends, and data gaps. "
				+ "Do not invent measurements, workouts, calories, sleep, or body metrics. "
				+ "Explain patterns, practical implications, and limitations in concise coaching language.";
	}

	private String analysisSystemInstruction() {
		return "You are an AI coaching interpretation layer for weekly fitness analysis. "
				+ "Use only provided deterministic analytics, the readiness decision, recent logs, and data gaps. "
				+ "Treat the readiness verdict as a pre-computed fact and do not override it. "
				+ "Write the summary as direct, practical coaching guidance rather than a generic recap. "
				+ "Do not calculate averages, workout volume, weight changes, adherence, personal records, or readiness. "
				+ "Do not invent body measurements, sleep, steps, workouts, missed workouts, calories, or trends. "
				+ "Return only valid JSON matching the requested structure. "
				+ "If data is missing or sparse, say the analysis is limited rather than guessing.";
	}

	private DashboardAiInterpretation toInterpretation(OpenAiChatResponse response) {
		String content = extractContent(response);
		if (content.isBlank()) {
			throw new AiProviderException(
					"AI dashboard interpretation returned an empty response",
					null,
					FailureReason.INVALID_RESPONSE,
					null);
		}

		return new DashboardAiInterpretation(true, content, List.of(), List.of(), Instant.now());
	}

	private String extractContent(OpenAiChatResponse response) {
		if (response == null || response.choices() == null || response.choices().isEmpty()) {
			return "";
		}

		OpenAiMessage message = response.choices().getFirst().message();
		if (message == null || message.content() == null) {
			return "";
		}

		return message.content().trim();
	}

	private record OpenAiChatResponse(List<OpenAiChoice> choices) {
	}

	private record OpenAiChoice(OpenAiMessage message) {
	}

	private record OpenAiMessage(
			String role,
			String content) {
	}

	private record StructuredAnalysis(
			String summary,
			List<String> interpretation,
			List<String> strengths,
			List<String> concerns,
			List<String> recommendations) {
		StructuredAnalysis {
			interpretation = interpretation == null ? List.of() : List.copyOf(interpretation);
			strengths = strengths == null ? List.of() : List.copyOf(strengths);
			concerns = concerns == null ? List.of() : List.copyOf(concerns);
			recommendations = recommendations == null ? List.of() : List.copyOf(recommendations);
		}
	}
}
