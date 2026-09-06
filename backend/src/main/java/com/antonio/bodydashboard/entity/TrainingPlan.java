package com.antonio.bodydashboard.entity;

import java.time.DayOfWeek;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "training_plans")
public class TrainingPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "day_of_week", length = 9)
	private DayOfWeek dayOfWeek;

	@Column(name = "content_json", nullable = false, columnDefinition = "text")
	private String contentJson;

	@Column(name = "workout_type", nullable = false, length = 10)
	private String workoutType;

	public Long getId() {
		return id;
	}

	public DayOfWeek getDayOfWeek() {
		return dayOfWeek;
	}

	public String getContentJson() {
		return contentJson;
	}

	public String getWorkoutType() {
		return workoutType;
	}
}