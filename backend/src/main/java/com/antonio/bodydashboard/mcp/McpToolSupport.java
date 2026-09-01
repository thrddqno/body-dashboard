package com.antonio.bodydashboard.mcp;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

final class McpToolSupport {

	private static final Logger log = LoggerFactory.getLogger(McpToolSupport.class);

	private McpToolSupport() {
	}

	static LocalDate parseDate(String value, String field) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Invalid '" + field + "': expected YYYY-MM-DD");
		}
		try {
			return LocalDate.parse(value);
		} catch (DateTimeParseException exception) {
			throw new IllegalArgumentException("Invalid '" + field + "': expected YYYY-MM-DD");
		}
	}

	static <T> T invoke(String toolName, Supplier<T> invocation) {
		log.info("MCP tool invoked: {}", toolName);
		try {
			T result = invocation.get();
			log.info("MCP tool completed: {}", toolName);
			return result;
		} catch (RuntimeException exception) {
			log.warn("MCP tool failed: {}", toolName);
			throw exception;
		}
	}
}
