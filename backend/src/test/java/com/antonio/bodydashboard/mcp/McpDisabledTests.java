package com.antonio.bodydashboard.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import io.modelcontextprotocol.server.McpSyncServer;

@SpringBootTest(properties = "spring.ai.mcp.server.enabled=false")
@ActiveProfiles("test")
class McpDisabledTests {

	@Autowired
	private ApplicationContext context;

	@Test
	void startsWithoutMcpBeansWhenDisabled() {
		assertThat(context.getBeansOfType(McpSyncServer.class)).isEmpty();
		assertThat(context.getBeansOfType(WorkoutMcpTools.class)).isEmpty();
		assertThat(context.getBeansOfType(TrainingPlanMcpTools.class)).isEmpty();
		assertThat(context.getBeansOfType(AnalyticsMcpTools.class)).isEmpty();
	}
}
