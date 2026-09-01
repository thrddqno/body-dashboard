package com.antonio.bodydashboard.entity;

import java.time.DayOfWeek;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "training_plans")
public class TrainingPlan {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "day_of_week", nullable = false, length = 9)
	private DayOfWeek dayOfWeek;

	@Column(name = "content_json", nullable = false, columnDefinition = "text")
	private String contentJson;

	@Column(name = "workout_type", nullable = false, length = 10)
	private String workoutType;

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
