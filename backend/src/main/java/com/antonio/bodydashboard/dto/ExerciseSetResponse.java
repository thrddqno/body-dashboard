package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;

public record ExerciseSetResponse(
		Long id,
		Integer setNumber,
		BigDecimal weightKg,
		Integer reps,
		Integer rir,
		boolean warmup) {
}
