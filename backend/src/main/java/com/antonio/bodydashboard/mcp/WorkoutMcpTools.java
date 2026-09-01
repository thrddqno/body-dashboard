package com.antonio.bodydashboard.mcp;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;

import com.antonio.bodydashboard.dto.WorkoutResponse;
import com.antonio.bodydashboard.service.WorkoutService;

public class WorkoutMcpTools {

	private static final long MAX_RANGE_DAYS = 366;

	private final WorkoutService workoutService;

	public WorkoutMcpTools(WorkoutService workoutService) {
		this.workoutService = workoutService;
	}

	@McpTool(
			name = "get_workouts",
			description = "Retrieve recorded workouts in an inclusive ISO date range.",
			generateOutputSchema = true,
			annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false, openWorldHint = false))
	public WorkoutRangeResult getWorkouts(
			@McpToolParam(description = "Inclusive start date in YYYY-MM-DD format", required = true) String from,
			@McpToolParam(description = "Inclusive end date in YYYY-MM-DD format", required = true) String to) {
		return McpToolSupport.invoke("get_workouts", () -> {
			LocalDate parsedFrom = McpToolSupport.parseDate(from, "from");
			LocalDate parsedTo = McpToolSupport.parseDate(to, "to");
			if (parsedFrom.isAfter(parsedTo)) {
				throw new IllegalArgumentException("Workout date range 'from' must not be after 'to'");
			}
			if (ChronoUnit.DAYS.between(parsedFrom, parsedTo) >= MAX_RANGE_DAYS) {
				throw new IllegalArgumentException("Workout date range must not exceed 366 days");
			}
			return new WorkoutRangeResult(parsedFrom, parsedTo, workoutService.getByDateRange(parsedFrom, parsedTo));
		});
	}

	@McpTool(
			name = "get_workout_by_date",
			description = "Retrieve all workouts recorded for an ISO date.",
			generateOutputSchema = true,
			annotations = @McpTool.McpAnnotations(readOnlyHint = true, destructiveHint = false, openWorldHint = false))
	public WorkoutDateResult getWorkoutByDate(
			@McpToolParam(description = "Date in YYYY-MM-DD format", required = true) String date) {
		return McpToolSupport.invoke("get_workout_by_date", () -> {
			LocalDate parsedDate = McpToolSupport.parseDate(date, "date");
			List<WorkoutResponse> workouts = workoutService.getByDate(parsedDate);
			return new WorkoutDateResult(parsedDate, !workouts.isEmpty(), workouts);
		});
	}

	public record WorkoutRangeResult(LocalDate from, LocalDate to, List<WorkoutResponse> workouts) {
		public WorkoutRangeResult {
			workouts = workouts == null ? List.of() : List.copyOf(workouts);
		}
	}

	public record WorkoutDateResult(LocalDate date, boolean found, List<WorkoutResponse> workouts) {
		public WorkoutDateResult {
			workouts = workouts == null ? List.of() : List.copyOf(workouts);
		}
	}
}
