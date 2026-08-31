package com.antonio.bodydashboard.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "exercise_sets")
public class ExerciseSet {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "workout_exercise_id", nullable = false)
	private WorkoutExercise workoutExercise;

	@Column(name = "set_number", nullable = false)
	private Integer setNumber;

	@Column(name = "weight_kg", nullable = false, precision = 7, scale = 2)
	private BigDecimal weightKg;

	@Column(nullable = false)
	private Integer reps;

	@Column
	private Integer rir;

	@Column(nullable = false)
	private boolean warmup;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public WorkoutExercise getWorkoutExercise() {
		return workoutExercise;
	}

	public void setWorkoutExercise(WorkoutExercise workoutExercise) {
		this.workoutExercise = workoutExercise;
	}

	public Integer getSetNumber() {
		return setNumber;
	}

	public void setSetNumber(Integer setNumber) {
		this.setNumber = setNumber;
	}

	public BigDecimal getWeightKg() {
		return weightKg;
	}

	public void setWeightKg(BigDecimal weightKg) {
		this.weightKg = weightKg;
	}

	public Integer getReps() {
		return reps;
	}

	public void setReps(Integer reps) {
		this.reps = reps;
	}

	public Integer getRir() {
		return rir;
	}

	public void setRir(Integer rir) {
		this.rir = rir;
	}

	public boolean isWarmup() {
		return warmup;
	}

	public void setWarmup(boolean warmup) {
		this.warmup = warmup;
	}
}
