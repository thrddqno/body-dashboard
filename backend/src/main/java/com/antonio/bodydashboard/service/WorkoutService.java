package com.antonio.bodydashboard.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antonio.bodydashboard.dto.ExerciseSetRequest;
import com.antonio.bodydashboard.dto.ExerciseSetResponse;
import com.antonio.bodydashboard.dto.WorkoutExerciseRequest;
import com.antonio.bodydashboard.dto.WorkoutExerciseResponse;
import com.antonio.bodydashboard.dto.WorkoutRequest;
import com.antonio.bodydashboard.dto.WorkoutResponse;
import com.antonio.bodydashboard.entity.ExerciseSet;
import com.antonio.bodydashboard.entity.Workout;
import com.antonio.bodydashboard.entity.WorkoutExercise;
import com.antonio.bodydashboard.entity.WorkoutStatus;
import com.antonio.bodydashboard.exception.WorkoutNotFoundException;
import com.antonio.bodydashboard.repository.WorkoutRepository;

@Service
public class WorkoutService {

	private final WorkoutRepository workoutRepository;

	public WorkoutService(WorkoutRepository workoutRepository) {
		this.workoutRepository = workoutRepository;
	}

	@Transactional
	public WorkoutResponse create(WorkoutRequest request) {
		Workout workout = new Workout();
		workout.setDate(request.date());
		workout.setWorkoutType(request.workoutType());
		workout.setStatus(request.status());
		workout.setNotes(request.notes());

		for (WorkoutExerciseRequest exerciseRequest : nullSafe(request.exercises())) {
			WorkoutExercise exercise = toExercise(exerciseRequest);
			workout.addExercise(exercise);
		}

		return toResponse(workoutRepository.save(workout));
	}

	@Transactional(readOnly = true)
	public List<WorkoutResponse> getAll() {
		return workoutRepository.findAllByOrderByDateDescCreatedAtDesc()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public WorkoutResponse getById(Long id) {
		return workoutRepository.findById(id)
				.map(this::toResponse)
				.orElseThrow(() -> new WorkoutNotFoundException(id));
	}

	@Transactional
	public WorkoutResponse updateStatus(Long id, WorkoutStatus status) {
		Workout workout = workoutRepository.findById(id)
				.orElseThrow(() -> new WorkoutNotFoundException(id));

		workout.setStatus(status);

		return toResponse(workoutRepository.saveAndFlush(workout));
	}

	@Transactional
	public WorkoutResponse updateWorkout(Long id, WorkoutRequest request) {
		Workout workout = workoutRepository.findById(id)
				.orElseThrow(() -> new WorkoutNotFoundException(id));

		if (workout.getStatus() == WorkoutStatus.COMPLETED) {
			throw new IllegalStateException("Cannot update a workout that is already completed");
		}

		workout.setDate(request.date());
		workout.setWorkoutType(request.workoutType());
		workout.setNotes(request.notes());

		workout.getExercises().clear();

		for (WorkoutExerciseRequest exerciseRequest : nullSafe(request.exercises())) {
			WorkoutExercise exercise = toExercise(exerciseRequest);
			workout.addExercise(exercise);
		}

		return toResponse(workoutRepository.save(workout));
	}

	private WorkoutExercise toExercise(WorkoutExerciseRequest request) {
		WorkoutExercise exercise = new WorkoutExercise();
		exercise.setExerciseName(request.exerciseName());
		exercise.setOrderIndex(request.orderIndex());

		for (ExerciseSetRequest setRequest : nullSafe(request.sets())) {
			exercise.addSet(toSet(setRequest));
		}

		return exercise;
	}

	private ExerciseSet toSet(ExerciseSetRequest request) {
		ExerciseSet set = new ExerciseSet();
		set.setSetNumber(request.setNumber());
		set.setWeightKg(request.weightKg());
		set.setReps(request.reps());
		set.setRir(request.rir());
		set.setWarmup(Boolean.TRUE.equals(request.warmup()));
		return set;
	}

	private WorkoutResponse toResponse(Workout workout) {
		return new WorkoutResponse(
				workout.getId(),
				workout.getDate(),
				workout.getWorkoutType(),
				workout.getStatus(),
				workout.getNotes(),
				workout.getExercises().stream()
						.sorted(Comparator.comparing(WorkoutExercise::getOrderIndex))
						.map(this::toExerciseResponse)
						.toList(),
				workout.getCreatedAt(),
				workout.getUpdatedAt());
	}

	private WorkoutExerciseResponse toExerciseResponse(WorkoutExercise exercise) {
		return new WorkoutExerciseResponse(
				exercise.getId(),
				exercise.getExerciseName(),
				exercise.getOrderIndex(),
				exercise.getSets().stream()
						.sorted(Comparator.comparing(ExerciseSet::getSetNumber))
						.map(this::toSetResponse)
						.toList());
	}

	private ExerciseSetResponse toSetResponse(ExerciseSet set) {
		return new ExerciseSetResponse(
				set.getId(),
				set.getSetNumber(),
				set.getWeightKg(),
				set.getReps(),
				set.getRir(),
				set.isWarmup());
	}

	private <T> List<T> nullSafe(List<T> values) {
		return values == null ? List.of() : values;
	}
}
