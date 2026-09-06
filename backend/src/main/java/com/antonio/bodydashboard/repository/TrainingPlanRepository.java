package com.antonio.bodydashboard.repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antonio.bodydashboard.entity.TrainingPlan;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Long> {

	Optional<TrainingPlan> findByDayOfWeek(DayOfWeek dayOfWeek);

	List<TrainingPlan> findByWorkoutType(String workoutType);
}