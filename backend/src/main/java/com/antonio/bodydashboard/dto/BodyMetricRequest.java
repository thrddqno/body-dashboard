package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record BodyMetricRequest(
		@NotNull(message = "date is required")
		LocalDate date,

		@NotNull(message = "weightKg is required")
		@DecimalMin(value = "0.0", inclusive = false, message = "weightKg must be positive")
		@Digits(integer = 4, fraction = 2, message = "weightKg must have at most 4 integer digits and 2 fractional digits")
		BigDecimal weightKg,

		@DecimalMin(value = "0.0", inclusive = false, message = "waistCm must be positive")
		@Digits(integer = 4, fraction = 2, message = "waistCm must have at most 4 integer digits and 2 fractional digits")
		BigDecimal waistCm,

		@DecimalMin(value = "0.0", inclusive = false, message = "bodyFatPercentage must be greater than 0")
		@DecimalMax(value = "100.0", message = "bodyFatPercentage must be less than or equal to 100")
		@Digits(integer = 3, fraction = 2, message = "bodyFatPercentage must have at most 3 integer digits and 2 fractional digits")
		BigDecimal bodyFatPercentage) {
}
