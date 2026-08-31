package com.antonio.bodydashboard.exception;

public class BodyMetricNotFoundException extends RuntimeException {

	public BodyMetricNotFoundException(Long id) {
		super("Body metric not found for id: " + id);
	}
}
