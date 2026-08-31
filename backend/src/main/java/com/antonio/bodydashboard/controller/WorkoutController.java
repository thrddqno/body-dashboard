package com.antonio.bodydashboard.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.antonio.bodydashboard.dto.WorkoutRequest;
import com.antonio.bodydashboard.dto.WorkoutResponse;
import com.antonio.bodydashboard.dto.WorkoutStatusUpdateRequest;
import com.antonio.bodydashboard.service.WorkoutService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

	private final WorkoutService workoutService;

	public WorkoutController(WorkoutService workoutService) {
		this.workoutService = workoutService;
	}

	@PostMapping
	public ResponseEntity<WorkoutResponse> create(@Valid @RequestBody WorkoutRequest request) {
		WorkoutResponse response = workoutService.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
				.path("/{id}")
				.buildAndExpand(response.id())
				.toUri();
		return ResponseEntity.created(location).body(response);
	}

	@GetMapping
	public List<WorkoutResponse> listWorkouts() {
		return workoutService.getAll();
	}

	@GetMapping("/{id}")
	public WorkoutResponse findWorkout(@PathVariable Long id) {
		return workoutService.getById(id);
	}

	@PatchMapping("/{id}/status")
	public WorkoutResponse changeWorkoutStatus(
			@PathVariable Long id,
			@Valid @RequestBody WorkoutStatusUpdateRequest request) {
		return workoutService.updateStatus(id, request.status());
	}

	@PutMapping("/{id}")
	public WorkoutResponse updateWorkout(
			@PathVariable Long id,
			@Valid @RequestBody WorkoutRequest request) {
		return workoutService.updateWorkout(id, request);
	}
}
