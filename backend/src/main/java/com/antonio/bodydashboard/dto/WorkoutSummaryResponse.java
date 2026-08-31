package com.antonio.bodydashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.antonio.bodydashboard.entity.WorkoutStatus;

public record WorkoutSummaryResponse(
		Long id,
		LocalDate date,
		String workoutType,
		WorkoutStatus status,
		String notes,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}
