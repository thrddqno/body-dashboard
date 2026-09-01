package com.antonio.bodydashboard.dto;

import java.util.List;

public record WorkoutPageResponse(
		List<WorkoutResponse> workouts,
		int page,
		int pageSize,
		long totalElements,
		int totalPages) {
}
