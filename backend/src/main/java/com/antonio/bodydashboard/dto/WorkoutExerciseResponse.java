package com.antonio.bodydashboard.dto;

import java.util.List;

public record WorkoutExerciseResponse(
		Long id,
		String exerciseName,
		Integer orderIndex,
		List<ExerciseSetResponse> sets) {
}
