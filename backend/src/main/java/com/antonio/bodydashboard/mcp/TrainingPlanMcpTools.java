package com.antonio.bodydashboard.mcp;

import java.time.LocalDate;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;

import com.antonio.bodydashboard.dto.TrainingPlanResponse;
import com.antonio.bodydashboard.service.TrainingPlanService;

public class TrainingPlanMcpTools {

	private final TrainingPlanService trainingPlanService;

	public TrainingPlanMcpTools(TrainingPlanService trainingPlanService) {
		this.trainingPlanService = trainingPlanService;
	}

	@McpTool(
			name = "get_training_plan",
			description = "Retrieve the persisted recurring training plan for an ISO date.",
			generateOutputSchema = true,
			annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false, openWorldHint = false))
	public TrainingPlanResult getTrainingPlan(
			@McpToolParam(description = "Date in YYYY-MM-DD format", required = true) String date) {
		return McpToolSupport.invoke("get_training_plan", () -> {
			LocalDate parsedDate = McpToolSupport.parseDate(date, "date");
			return trainingPlanService.getForDate(parsedDate)
					.map(plan -> new TrainingPlanResult(parsedDate, true, plan))
					.orElseGet(() -> new TrainingPlanResult(parsedDate, false, null));
		});
	}

	public record TrainingPlanResult(LocalDate date, boolean found, TrainingPlanResponse plan) {
	}
}
