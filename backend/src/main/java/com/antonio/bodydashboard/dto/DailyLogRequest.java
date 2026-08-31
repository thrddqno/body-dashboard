package com.antonio.bodydashboard.dto;

import com.antonio.bodydashboard.entity.EnergyLevel;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record DailyLogRequest(
		@PositiveOrZero(message = "sleepMinutes must be greater than or equal to 0")
		Integer sleepMinutes,

		@PositiveOrZero(message = "steps must be greater than or equal to 0")
		Integer steps,

		EnergyLevel energy,

		@Size(max = 4000, message = "painNotes must be at most 4000 characters")
		String painNotes,

		@Size(max = 4000, message = "recoveryNotes must be at most 4000 characters")
		String recoveryNotes,

		@PositiveOrZero(message = "estimatedCalories must be greater than or equal to 0")
		Integer estimatedCalories,

		@PositiveOrZero(message = "estimatedProteinGrams must be greater than or equal to 0")
		Integer estimatedProteinGrams) {
}
