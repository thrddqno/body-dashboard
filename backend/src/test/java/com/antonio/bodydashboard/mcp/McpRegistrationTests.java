package com.antonio.bodydashboard.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import io.modelcontextprotocol.server.McpSyncServer;
import io.modelcontextprotocol.server.transport.ServerTransportSecurityException;
import io.modelcontextprotocol.server.transport.ServerTransportSecurityValidator;

@SpringBootTest(properties = {
		"spring.ai.mcp.server.enabled=true",
		"spring.ai.mcp.server.annotation-scanner.enabled=true"
})
@ActiveProfiles("test")
class McpRegistrationTests {

	@Autowired
	private McpSyncServer mcpServer;

	@Autowired
	private ServerTransportSecurityValidator securityValidator;

	@Test
	void registersOnlyExpectedReadTools() {
		Set<String> names = mcpServer.listTools().stream().map(tool -> tool.name()).collect(Collectors.toSet());

		assertThat(names).containsExactlyInAnyOrder(
				"get_workouts",
				"get_workout_by_date",
				"get_weekly_workout_summary",
				"get_training_plan",
				"get_latest_analysis");
	}

	@Test
	void restrictsTransportToLoopbackHostsAndOrigins() {
		assertThatCode(() -> securityValidator.validateHeaders(Map.of(
				"Host", List.of("127.0.0.1:8080"),
				"Origin", List.of("http://localhost:5173"))))
				.doesNotThrowAnyException();

		assertThatThrownBy(() -> securityValidator.validateHeaders(Map.of(
				"Host", List.of("attacker.example"))))
				.isInstanceOf(ServerTransportSecurityException.class);
		assertThatThrownBy(() -> securityValidator.validateHeaders(Map.of(
				"Host", List.of("localhost:8080"),
				"Origin", List.of("https://attacker.example"))))
				.isInstanceOf(ServerTransportSecurityException.class);
	}
}
