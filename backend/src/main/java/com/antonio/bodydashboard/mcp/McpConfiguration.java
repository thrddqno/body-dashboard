package com.antonio.bodydashboard.mcp;

import java.util.List;

import org.springframework.ai.mcp.server.common.autoconfigure.properties.McpServerStreamableHttpProperties;
import org.springframework.ai.mcp.server.webmvc.transport.WebMvcStreamableServerTransportProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.antonio.bodydashboard.service.TrainingPlanService;
import com.antonio.bodydashboard.service.WorkoutService;
import com.antonio.bodydashboard.service.ai.WeeklyAiAnalysisService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapper;
import io.modelcontextprotocol.server.transport.DefaultServerTransportSecurityValidator;
import io.modelcontextprotocol.server.transport.ServerTransportSecurityValidator;
import tools.jackson.databind.json.JsonMapper;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(prefix = "spring.ai.mcp.server", name = "enabled", havingValue = "true")
public class McpConfiguration {

	@Bean
	ServerTransportSecurityValidator mcpTransportSecurityValidator() {
		return DefaultServerTransportSecurityValidator.builder()
				.allowedHosts(List.of("localhost:*", "127.0.0.1:*", "[::1]:*"))
				.allowedOrigins(List.of("http://localhost:*", "http://127.0.0.1:*", "http://[::1]:*"))
				.build();
	}

	@Bean
	WebMvcStreamableServerTransportProvider webMvcStreamableServerTransportProvider(
			@Qualifier("mcpServerJsonMapper") JsonMapper jsonMapper,
			McpServerStreamableHttpProperties properties,
			ServerTransportSecurityValidator securityValidator) {
		return WebMvcStreamableServerTransportProvider.builder()
				.jsonMapper(new JacksonMcpJsonMapper(jsonMapper))
				.mcpEndpoint(properties.getMcpEndpoint())
				.keepAliveInterval(properties.getKeepAliveInterval())
				.disallowDelete(properties.isDisallowDelete())
				.securityValidator(securityValidator)
				.build();
	}

	@Bean
	WorkoutMcpTools workoutMcpTools(WorkoutService workoutService) {
		return new WorkoutMcpTools(workoutService);
	}

	@Bean
	TrainingPlanMcpTools trainingPlanMcpTools(TrainingPlanService trainingPlanService) {
		return new TrainingPlanMcpTools(trainingPlanService);
	}

	@Bean
	AnalyticsMcpTools analyticsMcpTools(
			WorkoutAnalyticsService workoutAnalyticsService,
			WeeklyAiAnalysisService weeklyAiAnalysisService) {
		return new AnalyticsMcpTools(workoutAnalyticsService, weeklyAiAnalysisService);
	}
}
