package com.antonio.bodydashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.antonio.bodydashboard.entity.EnergyLevel;

public record DailyLogResponse(
		Long id,
		LocalDate date,
		Integer sleepMinutes,
		Integer steps,
		EnergyLevel energy,
		String painNotes,
		String recoveryNotes,
		Integer estimatedCalories,
		Integer estimatedProteinGrams,
		LocalDateTime createdAt,
		LocalDateTime updatedAt) {
}
