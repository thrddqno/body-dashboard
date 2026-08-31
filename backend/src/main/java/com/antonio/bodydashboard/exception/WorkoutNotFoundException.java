package com.antonio.bodydashboard.exception;

public class WorkoutNotFoundException extends RuntimeException {

	public WorkoutNotFoundException(Long id) {
		super("Workout not found for id: " + id);
	}
}
