package com.antonio.bodydashboard.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public record TrainingPlanResponse(
		LocalDate date,
		DayOfWeek dayOfWeek,
		String workoutType,
		String type,
		String title,
		String subtitle,
		List<String> warmup,
		List<Exercise> exercises,
		List<String> guardrails,
		List<String> optional) {

	public TrainingPlanResponse {
		warmup = copy(warmup);
		exercises = exercises == null ? List.of() : List.copyOf(exercises);
		guardrails = copy(guardrails);
		optional = copy(optional);
	}

	public record Exercise(
			String name,
			Integer sets,
			String reps,
			String rir,
			String rest,
			String notes) {
	}

	private static <T> List<T> copy(List<T> values) {
		return values == null ? List.of() : List.copyOf(values);
	}
}
