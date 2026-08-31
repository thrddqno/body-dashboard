package com.antonio.bodydashboard.dto;

import java.time.LocalDate;
import java.util.List;

import com.antonio.bodydashboard.entity.WorkoutStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorkoutRequest(
		@NotNull(message = "date is required")
		LocalDate date,

		@NotBlank(message = "workoutType is required")
		@Size(max = 100, message = "workoutType must be at most 100 characters")
		String workoutType,

		@NotNull(message = "status is required")
		WorkoutStatus status,

		@Size(max = 4000, message = "notes must be at most 4000 characters")
		String notes,

		List<@NotNull(message = "exercise must not be null") @Valid WorkoutExerciseRequest> exercises) {
}
