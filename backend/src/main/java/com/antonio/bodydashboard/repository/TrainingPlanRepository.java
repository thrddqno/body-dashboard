package com.antonio.bodydashboard.repository;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.TrainingPlan;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, DayOfWeek> {

	List<TrainingPlan> findByWorkoutType(String workoutType);
}
