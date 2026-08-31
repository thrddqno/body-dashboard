package com.antonio.bodydashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antonio.bodydashboard.dto.WeeklyAiAnalysisResponse;
import com.antonio.bodydashboard.service.ai.WeeklyAiAnalysisService;

@RestController
@RequestMapping("/api/ai-analysis")
public class AiAnalysisController {

	private final WeeklyAiAnalysisService weeklyAiAnalysisService;

	public AiAnalysisController(WeeklyAiAnalysisService weeklyAiAnalysisService) {
		this.weeklyAiAnalysisService = weeklyAiAnalysisService;
	}

	@PostMapping(value = "/weekly", consumes = MediaType.APPLICATION_JSON_VALUE)
	public WeeklyAiAnalysisResponse analyzeWeekly() {
		return weeklyAiAnalysisService.analyzeCurrentWeek();
	}

	@GetMapping("/weekly/latest")
	public ResponseEntity<WeeklyAiAnalysisResponse> latestWeekly() {
		return ResponseEntity.of(weeklyAiAnalysisService.latest());
	}
}
