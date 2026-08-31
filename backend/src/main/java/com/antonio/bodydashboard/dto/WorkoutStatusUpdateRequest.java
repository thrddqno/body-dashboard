package com.antonio.bodydashboard.dto;

import com.antonio.bodydashboard.entity.WorkoutStatus;

import jakarta.validation.constraints.NotNull;

public record WorkoutStatusUpdateRequest(
		@NotNull(message = "status is required")
		WorkoutStatus status) {
}
