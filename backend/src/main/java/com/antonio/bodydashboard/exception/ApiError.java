package com.antonio.bodydashboard.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(
		LocalDateTime timestamp,
		int status,
		String error,
		String message,
		Map<String, String> fieldErrors) {

	public static ApiError of(int status, String error, String message) {
		return new ApiError(LocalDateTime.now(), status, error, message, Map.of());
	}

	public static ApiError validation(int status, String error, String message, Map<String, String> fieldErrors) {
		return new ApiError(LocalDateTime.now(), status, error, message, Map.copyOf(fieldErrors));
	}
}
