package com.antonio.bodydashboard.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(BodyMetricNotFoundException.class)
	public ResponseEntity<ApiError> handleBodyMetricNotFound(BodyMetricNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiError.of(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(), exception.getMessage()));
	}

	@ExceptionHandler(DailyLogNotFoundException.class)
	public ResponseEntity<ApiError> handleDailyLogNotFound(DailyLogNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiError.of(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(), exception.getMessage()));
	}

	@ExceptionHandler(WorkoutNotFoundException.class)
	public ResponseEntity<ApiError> handleWorkoutNotFound(WorkoutNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiError.of(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(), exception.getMessage()));
	}

	@ExceptionHandler(DuplicateBodyMetricDateException.class)
	public ResponseEntity<ApiError> handleDuplicateBodyMetricDate(DuplicateBodyMetricDateException exception) {
		return ResponseEntity.badRequest()
				.body(ApiError.of(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(), exception.getMessage()));
	}

	@ExceptionHandler(AiProviderException.class)
	public ResponseEntity<ApiError> handleAiProviderException(AiProviderException exception) {
		String causeType = exception.getCause() == null
				? "none"
				: exception.getCause().getClass().getSimpleName();
		LOGGER.warn(
				"AI provider failure: reason={}, upstreamStatus={}, causeType={}",
				exception.getReason(),
				exception.getUpstreamStatus(),
				causeType);

		HttpStatus status = exception.getReason() == AiProviderException.FailureReason.RATE_LIMITED
				? HttpStatus.TOO_MANY_REQUESTS
				: HttpStatus.SERVICE_UNAVAILABLE;
		String message = switch (exception.getReason()) {
			case RATE_LIMITED -> "AI provider rate limit exceeded. Try again later.";
			case REJECTED -> "AI provider rejected the request. Check model access and configuration.";
			case INVALID_RESPONSE -> "AI provider returned an invalid response.";
			case UNAVAILABLE -> "AI analysis provider failed";
		};

		return ResponseEntity.status(status)
				.body(ApiError.of(
						status.value(),
						status.getReasonPhrase(),
						message));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
			fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
		}

		return ResponseEntity.badRequest()
				.body(ApiError.validation(
						HttpStatus.BAD_REQUEST.value(),
						HttpStatus.BAD_REQUEST.getReasonPhrase(),
						"Request validation failed",
						fieldErrors));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiError> handleUnreadableMessage(HttpMessageNotReadableException exception) {
		return ResponseEntity.badRequest()
				.body(ApiError.of(
						HttpStatus.BAD_REQUEST.value(),
						HttpStatus.BAD_REQUEST.getReasonPhrase(),
						"Request body is malformed or contains invalid values"));
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
		return ResponseEntity.badRequest()
				.body(ApiError.of(
						HttpStatus.BAD_REQUEST.value(),
						HttpStatus.BAD_REQUEST.getReasonPhrase(),
						"Request path contains an invalid value"));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiError.of(
						HttpStatus.INTERNAL_SERVER_ERROR.value(),
						HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
						"Persistence operation failed"));
	}
}
