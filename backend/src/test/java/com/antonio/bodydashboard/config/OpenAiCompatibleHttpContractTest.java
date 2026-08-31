package com.antonio.bodydashboard.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import com.antonio.bodydashboard.exception.AiProviderException;
import com.antonio.bodydashboard.service.ai.AnalysisContext;
import com.antonio.bodydashboard.service.ai.AnalysisResult;
import com.antonio.bodydashboard.service.ai.DashboardAiInterpretation;
import com.antonio.bodydashboard.service.ai.DashboardAnalysisContext;
import com.antonio.bodydashboard.service.ai.OpenAiCompatibleAiInterpretationProvider;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

class OpenAiCompatibleHttpContractTest {

	private static final String API_KEY = "local-contract-test-key";
	private static final String MODEL = "contract-test-model";

	private final ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();
	private final AtomicReference<CapturedRequest> capturedRequest = new AtomicReference<>();

	private HttpServer server;
	private URI baseUrl;
	private volatile int responseStatus;
	private volatile String responseBody;
	private volatile Duration responseDelay;

	@BeforeEach
	void startServer() throws IOException {
		server = HttpServer.create(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), 0), 0);
		server.createContext("/v1/chat/completions", this::handleRequest);
		server.start();

		baseUrl = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/v1/");
		responseStatus = 200;
		responseBody = successfulResponse("Local provider interpretation");
		responseDelay = Duration.ZERO;
	}

	@AfterEach
	void stopServer() {
		if (server != null) {
			server.stop(0);
		}
	}

	@Test
	void sendsOpenAiCompatibleRequestAndExtractsSuccessfulContent() throws Exception {
		OpenAiCompatibleAiInterpretationProvider provider = createProvider(Duration.ofSeconds(2));
		DashboardAnalysisContext context = dashboardContext();

		DashboardAiInterpretation result = provider.interpretDashboard(context);

		assertThat(result.available()).isTrue();
		assertThat(result.summary()).isEqualTo("Local provider interpretation");

		CapturedRequest request = capturedRequest.get();
		assertThat(request).isNotNull();
		assertThat(request.method()).isEqualTo("POST");
		assertThat(request.path()).isEqualTo("/v1/chat/completions");
		assertThat(request.authorization()).isEqualTo("Bearer " + API_KEY);

		JsonNode payload = objectMapper.readTree(request.body());
		assertThat(payload.path("model").asText()).isEqualTo(MODEL);
		assertThat(payload.path("temperature").asDouble()).isEqualTo(0.2);
		assertThat(payload.path("max_tokens").asInt()).isEqualTo(1200);
		assertThat(payload.path("messages").size()).isEqualTo(2);
		assertThat(payload.path("messages").get(0).path("role").asText()).isEqualTo("system");
		assertThat(payload.path("messages").get(0).path("content").asText())
				.contains("Use only the provided deterministic facts");
		assertThat(payload.path("messages").get(1).path("role").asText()).isEqualTo("user");

		String userMessage = payload.path("messages").get(1).path("content").asText();
		assertThat(userMessage).startsWith("Interpret this deterministic dashboard context.");
		JsonNode serializedContext = objectMapper.readTree(userMessage.substring(userMessage.indexOf("\n\n") + 2));
		assertThat(serializedContext.path("periodStart").asText()).isEqualTo("2026-08-24");
		assertThat(serializedContext.path("periodEnd").asText()).isEqualTo("2026-08-30");
		assertThat(serializedContext.path("metrics").path("averageSleepMinutes").asInt()).isEqualTo(435);
		assertThat(serializedContext.path("trends").get(0).asText()).isEqualTo("sleep improved");
		assertThat(serializedContext.path("dataGaps").get(0).asText()).isEqualTo("missing body fat readings");
	}

	@Test
	void analyzesWeeklyContextThroughTheSameHttpContract() throws Exception {
		responseBody = successfulResponse(structuredAnalysisContent());
		OpenAiCompatibleAiInterpretationProvider provider = createProvider(Duration.ofSeconds(2));

		AnalysisResult result = provider.analyze(analysisContext());

		assertThat(result.available()).isTrue();
		assertThat(result.summary()).isEqualTo("**Structured** summary");
		assertThat(result.interpretation()).containsExactly("Training interpretation");
		assertThat(result.strengths()).containsExactly("Consistent logging");
		assertThat(result.concerns()).containsExactly("Sparse sleep data");
		assertThat(result.recommendations()).containsExactly("Keep logging");
		JsonNode payload = objectMapper.readTree(capturedRequest.get().body());
		assertThat(payload.path("model").asText()).isEqualTo(MODEL);
		assertThat(payload.path("max_tokens").asInt()).isEqualTo(1200);
		assertThat(payload.path("response_format").path("type").asText()).isEqualTo("json_object");
		String userMessage = payload.path("messages").get(1).path("content").asText();
		assertThat(userMessage)
				.contains(
						"Return only one JSON object",
						"concise 2-4 sentence coaching directive",
						"most important supported action for the coming week",
						"No body fat data.");
		JsonNode serializedContext = objectMapper.readTree(userMessage.substring(userMessage.indexOf("\n\n") + 2));
		assertThat(serializedContext.path("recovery").path("averageSleepHours").asDouble()).isEqualTo(7.3);
		assertThat(serializedContext.path("recovery").has("averageSleepMinutes")).isFalse();
	}

	@Test
	void mapsMalformedJsonToSanitizedProviderException() {
		responseBody = "{not-json";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertSanitizedFailure(exception, "AI dashboard interpretation failed");
	}

	@Test
	void mapsEmptyHttpResponseToEmptyResponseException() {
		responseBody = "";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertEmptyResponseFailure(exception);
	}

	@Test
	void mapsMissingChoicesToEmptyResponseException() {
		responseBody = "{}";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertEmptyResponseFailure(exception);
	}

	@Test
	void mapsMissingMessageToEmptyResponseException() {
		responseBody = "{\"choices\":[{}]}";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertEmptyResponseFailure(exception);
	}

	@Test
	void mapsBlankContentToEmptyResponseException() {
		responseBody = successfulResponse("   \n  ");

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertEmptyResponseFailure(exception);
	}

	@Test
	void mapsBlankWeeklyContentToEmptyResponseException() {
		responseBody = successfulResponse("  ");

		AiProviderException exception = catchThrowableOfType(
				AiProviderException.class,
				() -> createProvider(Duration.ofSeconds(2)).analyze(analysisContext()));

		assertThat(exception).hasMessage("AI analysis returned an empty response").hasNoCause();
	}

	@Test
	void mapsNonSuccessfulStatusToSanitizedProviderException() {
		responseStatus = 429;
		responseBody = "{\"error\":{\"message\":\"sensitive upstream detail\"}}";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertSanitizedFailure(exception, "AI dashboard interpretation failed");
		assertThat(exception.getMessage()).doesNotContain("sensitive", API_KEY);
	}

	@Test
	void identifiesUpstreamRateLimitingWithoutExposingResponseDetails() {
		responseStatus = 429;
		responseBody = "{\"error\":{\"message\":\"sensitive upstream detail\"}}";

		AiProviderException exception = invokeProvider(createProvider(Duration.ofSeconds(2)));

		assertThat(exception.getReason()).isEqualTo(AiProviderException.FailureReason.RATE_LIMITED);
		assertThat(exception.getUpstreamStatus()).isEqualTo(429);
		assertThat(exception.getMessage()).doesNotContain("sensitive", API_KEY);
	}

	@Test
	void mapsReadTimeoutToSanitizedProviderException() {
		responseDelay = Duration.ofSeconds(1);

		AiProviderException exception = invokeProvider(createProvider(Duration.ofMillis(100)));

		assertSanitizedFailure(exception, "AI dashboard interpretation failed");
	}

	@Test
	void mapsTransportFailureToSanitizedProviderException() {
		OpenAiCompatibleAiInterpretationProvider provider = createProvider(Duration.ofSeconds(1));
		server.stop(0);
		server = null;

		AiProviderException exception = invokeProvider(provider);

		assertSanitizedFailure(exception, "AI dashboard interpretation failed");
	}

	private OpenAiCompatibleAiInterpretationProvider createProvider(Duration timeout) {
		AiInterpretationProperties properties = new AiInterpretationProperties();
		properties.setProvider(AiInterpretationProperties.Provider.OPENAI_COMPATIBLE);
		properties.setApiKey(API_KEY);
		properties.setModel(MODEL);
		properties.setBaseUrl(baseUrl);
		properties.setTimeout(timeout);

		return new AiInterpretationConfig().openAiCompatibleAiInterpretationProvider(
				properties,
				objectMapper);
	}

	private DashboardAnalysisContext dashboardContext() {
		return new DashboardAnalysisContext(
				LocalDate.of(2026, 8, 24),
				LocalDate.of(2026, 8, 30),
				Map.of("averageSleepMinutes", 435),
				List.of("sleep improved"),
				List.of("missing body fat readings"));
	}

	private AnalysisContext analysisContext() {
		LocalDate start = LocalDate.of(2026, 8, 24);
		LocalDate end = LocalDate.of(2026, 8, 30);
		return new AnalysisContext(
				Instant.EPOCH,
				new AnalysisContext.Period(start, end),
				new AnalysisContext.BodyFacts(new java.math.BigDecimal("80.00"), end, null, null),
				new AnalysisContext.RecoveryFacts(start, end, new java.math.BigDecimal("7.3"), 8000, 5),
				new AnalysisContext.TrainingFacts(start, end, 2, 1, new java.math.BigDecimal("66.67"), List.of(), List.of()),
				List.of(),
				List.of(),
				List.of("No body fat data."));
	}

	private AiProviderException invokeProvider(OpenAiCompatibleAiInterpretationProvider provider) {
		AiProviderException exception = catchThrowableOfType(
				AiProviderException.class,
				() -> provider.interpretDashboard(dashboardContext()));
		assertThat(exception).isNotNull();
		return exception;
	}

	private void assertSanitizedFailure(AiProviderException exception, String expectedMessage) {
		assertThat(exception).hasMessage(expectedMessage).hasCauseInstanceOf(RuntimeException.class);
		assertThat(exception.getMessage()).doesNotContain(API_KEY, baseUrl.toString());
	}

	private void assertEmptyResponseFailure(AiProviderException exception) {
		assertThat(exception)
				.hasMessage("AI dashboard interpretation returned an empty response")
				.hasNoCause();
	}

	private String successfulResponse(String content) {
		try {
			return objectMapper.writeValueAsString(Map.of(
					"choices", List.of(Map.of(
							"message", Map.of("role", "assistant", "content", content)))));
		} catch (Exception exception) {
			throw new IllegalStateException(exception);
		}
	}

	private String structuredAnalysisContent() {
		try {
			return objectMapper.writeValueAsString(Map.of(
					"summary", "**Structured** summary",
					"interpretation", List.of("Training interpretation"),
					"strengths", List.of("Consistent logging"),
					"concerns", List.of("Sparse sleep data"),
					"recommendations", List.of("Keep logging")));
		} catch (Exception exception) {
			throw new IllegalStateException(exception);
		}
	}

	private void handleRequest(HttpExchange exchange) throws IOException {
		capturedRequest.set(new CapturedRequest(
				exchange.getRequestMethod(),
				exchange.getRequestURI().getPath(),
				exchange.getRequestHeaders().getFirst("Authorization"),
				new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8)));

		try {
			Thread.sleep(responseDelay);
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			return;
		}

		byte[] body = responseBody.getBytes(StandardCharsets.UTF_8);
		exchange.getResponseHeaders().set("Content-Type", "application/json");
		exchange.sendResponseHeaders(responseStatus, body.length);
		try (exchange; var output = exchange.getResponseBody()) {
			output.write(body);
		}
	}

	private record CapturedRequest(String method, String path, String authorization, String body) {
	}
}
