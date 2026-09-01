package com.antonio.bodydashboard.mcp;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;

import com.antonio.bodydashboard.dto.WeeklyAiAnalysisResponse;
import com.antonio.bodydashboard.service.ai.WeeklyAiAnalysisService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsService;
import com.antonio.bodydashboard.service.analytics.WorkoutAnalyticsSummary;

public class AnalyticsMcpTools {

	private final WorkoutAnalyticsService workoutAnalyticsService;
	private final WeeklyAiAnalysisService weeklyAiAnalysisService;

	public AnalyticsMcpTools(
			WorkoutAnalyticsService workoutAnalyticsService,
			WeeklyAiAnalysisService weeklyAiAnalysisService) {
		this.workoutAnalyticsService = workoutAnalyticsService;
		this.weeklyAiAnalysisService = weeklyAiAnalysisService;
	}

	@McpTool(
			name = "get_weekly_workout_summary",
			description = "Retrieve deterministic factual workout analytics for a Monday-to-Sunday week.",
			generateOutputSchema = true,
			annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false, openWorldHint = false))
	public WeeklyWorkoutSummaryResult getWeeklyWorkoutSummary(
			@McpToolParam(description = "Monday week start in YYYY-MM-DD format", required = true) String weekStart) {
		return McpToolSupport.invoke("get_weekly_workout_summary", () -> {
			LocalDate start = McpToolSupport.parseDate(weekStart, "weekStart");
			if (start.getDayOfWeek() != DayOfWeek.MONDAY) {
				throw new IllegalArgumentException("Invalid 'weekStart': date must be a Monday");
			}
			WorkoutAnalyticsSummary summary = workoutAnalyticsService.summarizeWeek(start, start.plusDays(6));
			return WeeklyWorkoutSummaryResult.from(summary);
		});
	}

	@McpTool(
			name = "get_latest_analysis",
			description = "Retrieve the latest stored weekly AI analysis without generating a new analysis.",
			generateOutputSchema = true,
			annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false, openWorldHint = false))
	public LatestAnalysisResult getLatestAnalysis() {
		return McpToolSupport.invoke("get_latest_analysis", () -> weeklyAiAnalysisService.latest()
				.map(analysis -> new LatestAnalysisResult(true, analysis))
				.orElseGet(() -> new LatestAnalysisResult(false, null)));
	}

	public record WeeklyWorkoutSummaryResult(
			LocalDate weekStart,
			LocalDate weekEnd,
			long completedWorkouts,
			long missedWorkouts,
			BigDecimal adherencePercentage,
			List<WorkoutAnalyticsSummary.WorkoutVolume> workoutVolumes,
			List<WorkoutAnalyticsSummary.ExercisePersonalRecords> personalRecords) {

		static WeeklyWorkoutSummaryResult from(WorkoutAnalyticsSummary summary) {
			return new WeeklyWorkoutSummaryResult(
					summary.weekStart(),
					summary.weekEnd(),
					summary.completedWorkoutsThisWeek(),
					summary.missedWorkoutsThisWeek(),
					summary.adherencePercentage().orElse(null),
					summary.workoutVolumes(),
					summary.personalRecords());
		}
	}

	public record LatestAnalysisResult(boolean available, WeeklyAiAnalysisResponse analysis) {
	}
}
