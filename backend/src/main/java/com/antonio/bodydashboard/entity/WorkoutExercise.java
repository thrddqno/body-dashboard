package com.antonio.bodydashboard.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "workout_id", nullable = false)
	private Workout workout;

	@Column(name = "exercise_name", nullable = false)
	private String exerciseName;

	@Column(name = "order_index", nullable = false)
	private Integer orderIndex;

	@OneToMany(mappedBy = "workoutExercise", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("setNumber ASC")
	private List<ExerciseSet> sets = new ArrayList<>();

	public void addSet(ExerciseSet set) {
		set.setWorkoutExercise(this);
		sets.add(set);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Workout getWorkout() {
		return workout;
	}

	public void setWorkout(Workout workout) {
		this.workout = workout;
	}

	public String getExerciseName() {
		return exerciseName;
	}

	public void setExerciseName(String exerciseName) {
		this.exerciseName = exerciseName;
	}

	public Integer getOrderIndex() {
		return orderIndex;
	}

	public void setOrderIndex(Integer orderIndex) {
		this.orderIndex = orderIndex;
	}

	public List<ExerciseSet> getSets() {
		return sets;
	}

	public void setSets(List<ExerciseSet> sets) {
		this.sets.clear();
		if (sets != null) {
			sets.forEach(this::addSet);
		}
	}
}
