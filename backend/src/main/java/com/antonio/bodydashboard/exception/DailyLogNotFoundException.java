package com.antonio.bodydashboard.exception;

import java.time.LocalDate;

public class DailyLogNotFoundException extends RuntimeException {

	public DailyLogNotFoundException(LocalDate date) {
		super("Daily log not found for date: " + date);
	}
}
