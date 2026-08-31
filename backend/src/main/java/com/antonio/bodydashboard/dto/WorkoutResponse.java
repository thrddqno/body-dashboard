package com.antonio.bodydashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.antonio.bodydashboard.entity.WorkoutStatus;

public record WorkoutResponse(
		Long id,
		LocalDate date,
		String workoutType,
		WorkoutStatus status,
		String notes,
		List<WorkoutExerciseResponse> exercises,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}
