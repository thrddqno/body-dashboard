package com.antonio.bodydashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BodyMetricResponse(
		Long id,
		LocalDate date,
		BigDecimal weightKg,
		BigDecimal waistCm,
		BigDecimal bodyFatPercentage,
		LocalDateTime createdAt) {
}
