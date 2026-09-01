package com.antonio.bodydashboard.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.antonio.bodydashboard.dto.TrainingPlanResponse;
import com.antonio.bodydashboard.service.TrainingPlanService;

@RestController
@RequestMapping("/api/training-plans")
public class TrainingPlanController {

	private final TrainingPlanService trainingPlanService;

	public TrainingPlanController(TrainingPlanService trainingPlanService) {
		this.trainingPlanService = trainingPlanService;
	}

	@GetMapping("/{date}")
	public ResponseEntity<TrainingPlanResponse> findForDate(
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@RequestParam(required = false) String workoutType) {
		return ResponseEntity.of(trainingPlanService.getForDate(date, workoutType));
	}
}
