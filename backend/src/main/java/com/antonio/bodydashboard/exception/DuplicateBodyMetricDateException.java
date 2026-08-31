package com.antonio.bodydashboard.exception;

import java.time.LocalDate;

public class DuplicateBodyMetricDateException extends RuntimeException {

	public DuplicateBodyMetricDateException(LocalDate date) {
		super("Body metric already exists for date: " + date);
	}
}
