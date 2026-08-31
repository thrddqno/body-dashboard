package com.antonio.bodydashboard.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antonio.bodydashboard.dto.WeeklyAnalyticsResponse;
import com.antonio.bodydashboard.service.WeeklyAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

	private final WeeklyAnalyticsService weeklyAnalyticsService;

	public AnalyticsController(WeeklyAnalyticsService weeklyAnalyticsService) {
		this.weeklyAnalyticsService = weeklyAnalyticsService;
	}

	@GetMapping("/weekly")
	public WeeklyAnalyticsResponse getWeeklySummary() {
		return weeklyAnalyticsService.getCurrentWeekSummary();
	}
}
