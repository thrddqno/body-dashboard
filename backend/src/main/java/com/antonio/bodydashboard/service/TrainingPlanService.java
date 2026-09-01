package com.antonio.bodydashboard.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.TrainingPlanResponse;
import com.antonio.bodydashboard.entity.TrainingPlan;
import com.antonio.bodydashboard.repository.TrainingPlanRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class TrainingPlanService {

	private final TrainingPlanRepository repository;
	private final ObjectMapper objectMapper;

	public TrainingPlanService(TrainingPlanRepository repository, ObjectMapper objectMapper) {
		this.repository = repository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public Optional<TrainingPlanResponse> getForDate(LocalDate date) {
		return getForDate(date, null);
	}

	@Transactional(readOnly = true)
	public Optional<TrainingPlanResponse> getForDate(LocalDate date, String workoutType) {
		if (date == null) {
			throw new IllegalArgumentException("Training plan date is required");
		}

		Optional<TrainingPlan> scheduledPlan = repository.findById(date.getDayOfWeek());
		if (workoutType == null || workoutType.isBlank()) {
			return scheduledPlan.map(plan -> toResponse(date, plan));
		}

		String normalizedWorkoutType = workoutType.trim().toUpperCase(Locale.ROOT);
		if (scheduledPlan.filter(plan -> plan.getWorkoutType().equals(normalizedWorkoutType)).isPresent()) {
			return scheduledPlan.map(plan -> toResponse(date, plan));
		}

		return repository.findByWorkoutType(normalizedWorkoutType).stream()
				.min(Comparator.comparing(TrainingPlan::getDayOfWeek))
				.map(plan -> toResponse(date, plan));
	}

	private TrainingPlanResponse toResponse(LocalDate date, TrainingPlan plan) {
		try {
			PlanContent content = objectMapper.readValue(plan.getContentJson(), PlanContent.class);
			return new TrainingPlanResponse(
					date,
					date.getDayOfWeek(),
					plan.getWorkoutType(),
					content.type(),
					content.title(),
					content.subtitle(),
					content.warmup(),
					content.exercises(),
					content.guardrails(),
					content.optional());
		} catch (JacksonException exception) {
			throw new IllegalStateException("Stored training plan is invalid", exception);
		}
	}

	private record PlanContent(
			String type,
			String title,
			String subtitle,
			List<String> warmup,
			List<TrainingPlanResponse.Exercise> exercises,
			List<String> guardrails,
			List<String> optional) {
	}
}
