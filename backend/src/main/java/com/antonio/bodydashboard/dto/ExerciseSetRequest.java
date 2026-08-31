package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExerciseSetRequest(
		@NotNull(message = "setNumber is required")
		@Positive(message = "setNumber must be positive")
		Integer setNumber,

		@NotNull(message = "weightKg is required")
		@DecimalMin(value = "0.0", message = "weightKg must be greater than or equal to 0")
		@Digits(integer = 5, fraction = 2, message = "weightKg must have at most 5 integer digits and 2 fractional digits")
		BigDecimal weightKg,

		@NotNull(message = "reps is required")
		@Positive(message = "reps must be positive")
		Integer reps,

		@Min(value = 0, message = "rir must be greater than or equal to 0")
		@Max(value = 10, message = "rir must be less than or equal to 10")
		Integer rir,

		Boolean warmup) {
}
