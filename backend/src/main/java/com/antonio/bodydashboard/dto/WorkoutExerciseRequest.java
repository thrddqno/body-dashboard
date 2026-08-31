package com.antonio.bodydashboard.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record WorkoutExerciseRequest(
		@NotBlank(message = "exerciseName is required")
		@Size(max = 255, message = "exerciseName must be at most 255 characters")
		String exerciseName,

		@NotNull(message = "orderIndex is required")
		@Positive(message = "orderIndex must be positive")
		Integer orderIndex,

		List<@NotNull(message = "set must not be null") @Valid ExerciseSetRequest> sets) {
}
