package com.antonio.bodydashboard.exception;

import org.hibernate.exception.ConstraintViolationException;

public final class PersistenceConstraintViolation {

	private PersistenceConstraintViolation() {
	}

	public static boolean isConstraint(Throwable exception, String constraintName) {
		Throwable cause = exception;
		while (cause != null) {
			if (cause instanceof ConstraintViolationException constraintViolation
					&& constraintName.equalsIgnoreCase(unqualifiedName(constraintViolation.getConstraintName()))) {
				return true;
			}
			cause = cause.getCause();
		}
		return false;
	}

	private static String unqualifiedName(String constraintName) {
		if (constraintName == null) {
			return null;
		}
		String normalized = constraintName.replace("\"", "");
		int separator = normalized.lastIndexOf('.');
		return separator >= 0 ? normalized.substring(separator + 1) : normalized;
	}
}
